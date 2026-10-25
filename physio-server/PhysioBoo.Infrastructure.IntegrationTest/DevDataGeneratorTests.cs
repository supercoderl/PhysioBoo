using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using NSubstitute;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Seeding;
using PhysioBoo.Infrastructure.Database;
using PhysioBoo.Infrastructure.Database.DevData;
using PhysioBoo.SharedKernel.Utils;
using Xunit;
using Role = PhysioBoo.Domain.Entities.Core.Role;

namespace PhysioBoo.Infrastructure.IntegrationTest
{
    /// <summary>The dev data generator against a real, disposable PostgreSQL database (see <see cref="PgFactAttribute"/>).</summary>
    public sealed class DevDataGeneratorTests : IClassFixture<PostgresFixture>
    {
        private const int Patients = 40;

        private readonly PostgresFixture _fixture;

        public DevDataGeneratorTests(PostgresFixture fixture) => _fixture = fixture;

        [PgFact]
        public async Task Demo_Facility_Creates_A_Connected_Consistent_Dataset()
        {
            Guid tenantId = await NewTenantAsync();
            DevDataResult result = await GenerateAsync(DemoFacilityModule.ModuleKey, tenantId);

            // A fresh tenant reuses nothing of its own; only the shared reference data may already exist from another test.
            string[] sharedReferenceData = { MasterDataModule.ModuleKey, "specialties", "appointmentTypes" };
            Assert.All(result.Reused, key => Assert.Contains(key, sharedReferenceData));
            foreach (string key in new[] { "branches", "departments", "rooms", "doctors", "users", "doctorSpecialties", "staff", "services", "schedules", "patients", "appointments" })
                Assert.True(result.Created.GetValueOrDefault(key) > 0, $"Nothing was created for '{key}'.");
            Assert.Equal(Patients, result.Created["patients"]);

            await using ApplicationDbContext db = _fixture.CreateContext();
            DateTime now = TimeZoneHelper.GetLocalTimeNow();

            List<Doctor> doctors = await db.Doctors.IgnoreQueryFilters().Where(d => d.TenantId == tenantId).ToListAsync();
            List<Department> departments = await db.Departments.IgnoreQueryFilters().Where(d => d.TenantId == tenantId).ToListAsync();
            List<DoctorSchedule> schedules = await db.DoctorSchedules.IgnoreQueryFilters().Where(s => s.TenantId == tenantId).ToListAsync();
            List<Patient> patients = await db.Patients.IgnoreQueryFilters().Where(p => p.TenantId == tenantId).ToListAsync();
            List<Appointment> appointments = await db.Appointments.IgnoreQueryFilters().Where(a => a.TenantId == tenantId).ToListAsync();

            // Providers: user + profile + role + department + specialty, all in the tenant.
            foreach (Doctor doctor in doctors)
            {
                User user = await db.Users.IgnoreQueryFilters().SingleAsync(u => u.Id == doctor.Id);
                Assert.Equal(tenantId, user.TenantId);
                Assert.Equal(doctor.Id, user.ProfileId);
                Assert.True(user.IsActive);
                Assert.Contains(departments, d => d.Id == doctor.DepartmentId);
                Assert.True(doctor.IsVerified);
                Assert.Equal(EmploymentStatus.Active, doctor.EmploymentStatus);
                Assert.NotNull(doctor.PrimarySpecialtyId);
                Assert.True(await db.DoctorSpecialties.IgnoreQueryFilters().AnyAsync(s => s.Id == doctor.PrimarySpecialtyId && s.DoctorId == doctor.Id));
                Assert.True(await db.UserRoles.AnyAsync(ur => ur.UserId == doctor.Id && ur.Role!.Code == "DOCTOR"));
                Assert.Contains(schedules, s => s.DoctorId == doctor.Id);
            }

            // Services: published, linked to a department of the tenant and to doctors who work there.
            List<MedicalService> services = await db.MedicalServices.IgnoreQueryFilters().Include(s => s.Departments).Include(s => s.Doctors).Where(s => s.TenantId == tenantId).ToListAsync();
            Assert.All(services, s =>
            {
                Assert.Equal(ServiceStatus.Active, s.Status);
                Assert.Single(s.Departments);
                Department department = departments.Single(d => d.Id == s.Departments.Single().DepartmentId);
                Assert.Equal(department.HospitalId, s.HospitalId);
                Assert.All(s.Doctors, link => Assert.Equal(department.Id, doctors.Single(d => d.Id == link.DoctorId).DepartmentId));
            });

            // Schedules belong to the doctor's own department and branch.
            Assert.All(schedules, s =>
            {
                Doctor doctor = doctors.Single(d => d.Id == s.DoctorId);
                Assert.Equal(doctor.DepartmentId, s.DepartmentId);
                Assert.Equal(departments.Single(d => d.Id == s.DepartmentId).HospitalId, s.HospitalId);
                Assert.True(s.StartTime < s.EndTime);
            });

            Assert.All(patients, p => Assert.Contains(doctors, d => d.Id == p.PrimaryDoctorId));

            // Appointments: valid links, inside working hours, no double booking, status matches time.
            Assert.NotEmpty(appointments);
            Assert.Equal(appointments.Count, appointments.Select(a => (a.DoctorId, a.ScheduledDate, a.ScheduledTime)).Distinct().Count());
            Assert.Equal(appointments.Count, appointments.Select(a => (a.PatientId, a.ScheduledDate, a.ScheduledTime)).Distinct().Count());
            Assert.Equal(appointments.Count, appointments.Select(a => a.AppointmentNumber).Distinct().Count());

            foreach (Appointment a in appointments)
            {
                Doctor doctor = doctors.Single(d => d.Id == a.DoctorId);
                Patient patient = patients.Single(p => p.Id == a.PatientId);
                Assert.Equal(doctor.DepartmentId, a.DepartmentId);
                Assert.True(a.ScheduledDate >= patient.RegistrationDate);

                DoctorSchedule schedule = schedules.Single(s => s.DoctorId == a.DoctorId && s.DayOfWeek == (int)a.ScheduledDate.DayOfWeek);
                Assert.Equal(schedule.HospitalId, a.HospitalId);
                Assert.True(a.ScheduledTime >= schedule.StartTime && a.ScheduledEndTime <= schedule.EndTime);
                if (schedule.BreakStartTime is not null && schedule.BreakEndTime is not null)
                    Assert.False(a.ScheduledTime < schedule.BreakEndTime && a.ScheduledEndTime > schedule.BreakStartTime, "Appointment overlaps the doctor's break.");

                DateTime at = a.ScheduledDate.ToDateTime(a.ScheduledTime);
                switch (a.AppointmentStatus)
                {
                    case AppointmentStatus.Completed:
                        Assert.True(at < now);
                        Assert.NotNull(a.Diagnosis);
                        Assert.NotNull(a.ActualStartTime);
                        break;
                    case AppointmentStatus.NoShow:
                        Assert.True(at < now);
                        break;
                    case AppointmentStatus.Scheduled:
                    case AppointmentStatus.Confirmed:
                        Assert.True(at >= now);
                        break;
                    case AppointmentStatus.Cancelled:
                        Assert.False(string.IsNullOrWhiteSpace(a.CancellationReason));
                        Assert.NotNull(a.CancelledAt);
                        Assert.True(a.CancelledAt <= now);
                        break;
                    default:
                        Assert.Fail($"Unexpected status {a.AppointmentStatus}.");
                        break;
                }
            }

            Assert.Contains(appointments, a => a.AppointmentStatus == AppointmentStatus.Completed);
            Assert.Contains(appointments, a => a.AppointmentStatus is AppointmentStatus.Scheduled or AppointmentStatus.Confirmed);

            // Generated accounts have no known password: the hash belongs to a random value that was thrown away.
            Assert.Equal(1, await db.Users.IgnoreQueryFilters().Where(u => u.TenantId == tenantId).Select(u => u.PasswordHash).Distinct().CountAsync());
        }

        [PgFact]
        public async Task Running_It_Again_Reuses_Everything_And_Creates_Nothing()
        {
            Guid tenantId = await NewTenantAsync();
            await GenerateAsync(DemoFacilityModule.ModuleKey, tenantId);
            int before = await CountRowsAsync(tenantId);

            DevDataResult second = await GenerateAsync(DemoFacilityModule.ModuleKey, tenantId);

            Assert.Empty(second.Created);
            Assert.Equal(8, second.Reused.Count);
            Assert.Equal(before, await CountRowsAsync(tenantId));
        }

        [PgFact]
        public async Task Tenants_Stay_Isolated()
        {
            Guid tenantA = await NewTenantAsync();
            Guid tenantB = await NewTenantAsync();
            await GenerateAsync(DemoFacilityModule.ModuleKey, tenantA);
            await GenerateAsync(DemoFacilityModule.ModuleKey, tenantB);

            await using ApplicationDbContext db = _fixture.CreateContext();
            foreach (Guid tenant in new[] { tenantA, tenantB })
            {
                HashSet<Guid> hospitals = (await db.Hospitals.IgnoreQueryFilters().Where(h => h.TenantId == tenant).Select(h => h.Id).ToListAsync()).ToHashSet();
                HashSet<Guid> doctors = (await db.Doctors.IgnoreQueryFilters().Where(d => d.TenantId == tenant).Select(d => d.Id).ToListAsync()).ToHashSet();
                HashSet<Guid> patients = (await db.Patients.IgnoreQueryFilters().Where(p => p.TenantId == tenant).Select(p => p.Id).ToListAsync()).ToHashSet();

                List<Appointment> appointments = await db.Appointments.IgnoreQueryFilters().Where(a => a.TenantId == tenant).ToListAsync();
                Assert.NotEmpty(appointments);
                Assert.All(appointments, a =>
                {
                    Assert.Contains(a.DoctorId, doctors);
                    Assert.Contains(a.PatientId, patients);
                    Assert.Contains(a.HospitalId, hospitals);
                });
                Assert.All(await db.Patients.IgnoreQueryFilters().Where(p => p.TenantId == tenant).ToListAsync(), p => Assert.Contains(p.PrimaryDoctorId, doctors));
                Assert.All(await db.Departments.IgnoreQueryFilters().Where(d => d.TenantId == tenant).ToListAsync(), d => Assert.Contains(d.HospitalId, hospitals));
            }

            // Reference data is shared, so the second tenant did not add a second copy.
            Assert.Equal(MasterDataModule.Specialties.Count, await db.MedicalSpecialties.CountAsync(s => MasterDataModule.Specialties.Select(x => x.Name).Contains(s.Name)));
        }

        [PgFact]
        public async Task It_Refuses_To_Run_Outside_Development()
        {
            Guid tenantId = await NewTenantAsync();
            await using ApplicationDbContext db = _fixture.CreateContext();
            DevDataService service = CreateService(db, Environments.Production);

            Assert.False(service.GetModules().Enabled);
            await Assert.ThrowsAsync<DevDataException>(() => service.GenerateAsync(DemoFacilityModule.ModuleKey, tenantId, Patients));
            Assert.Equal(0, await CountRowsAsync(tenantId));
        }

        [PgFact]
        public async Task It_Rejects_An_Unknown_Tenant_A_Bad_Count_And_An_Unknown_Module()
        {
            await using ApplicationDbContext db = _fixture.CreateContext();
            DevDataService service = CreateService(db, Environments.Development);
            Guid tenantId = await NewTenantAsync();

            await Assert.ThrowsAsync<DevDataException>(() => service.GenerateAsync(DemoFacilityModule.ModuleKey, Guid.NewGuid(), Patients));
            await Assert.ThrowsAsync<DevDataException>(() => service.GenerateAsync(DemoFacilityModule.ModuleKey, tenantId, 0));
            await Assert.ThrowsAsync<DevDataException>(() => service.GenerateAsync(DemoFacilityModule.ModuleKey, tenantId, 5000));
            await Assert.ThrowsAsync<DevDataException>(() => service.GenerateAsync("no-such-module", tenantId, 10));
            Assert.Equal(0, await CountRowsAsync(tenantId));
        }

        [PgFact]
        public async Task A_Failure_Rolls_Back_The_Whole_Run_Including_Its_Dependencies()
        {
            Guid tenantId = await NewTenantAsync();
            await using ApplicationDbContext db = _fixture.CreateContext();
            DevDataService service = CreateService(db, Environments.Development, new FailingModule());

            await Assert.ThrowsAsync<InvalidOperationException>(() => service.GenerateAsync(FailingModule.ModuleKey, tenantId, 10));

            await using ApplicationDbContext verify = _fixture.CreateContext();
            Assert.Equal(0, await CountRowsAsync(tenantId));
            Assert.False(await verify.Hospitals.IgnoreQueryFilters().AnyAsync(h => h.TenantId == tenantId));
        }

        /// <summary>Writes a dependency's rows, then fails: nothing of either may remain.</summary>
        private sealed class FailingModule : IDevDataModule
        {
            public const string ModuleKey = "failing";

            public string Key => ModuleKey;
            public string Label => "Failing";
            public string Description => "Always fails.";
            public IReadOnlyList<string> DependsOn => new[] { HospitalStructureModule.ModuleKey };
            public Task<bool> HasDataAsync(DevDataContext context, CancellationToken ct) => Task.FromResult(false);
            public Task GenerateAsync(DevDataContext context, int count, CancellationToken ct) => throw new InvalidOperationException("boom");
        }

        private async Task<DevDataResult> GenerateAsync(string moduleKey, Guid tenantId)
        {
            await using ApplicationDbContext db = _fixture.CreateContext();
            await EnsureDoctorRoleAsync(db);
            return await CreateService(db, Environments.Development).GenerateAsync(moduleKey, tenantId, Patients);
        }

        private static DevDataService CreateService(ApplicationDbContext db, string environmentName, params IDevDataModule[] extraModules)
        {
            IHostEnvironment environment = Substitute.For<IHostEnvironment>();
            environment.EnvironmentName.Returns(environmentName);

            IDevDataModule[] modules =
            {
                new DemoFacilityModule(), new HospitalStructureModule(), new MasterDataModule(), new ProvidersModule(),
                new StaffModule(), new MedicalServicesModule(), new SchedulesModule(), new PatientsModule(), new AppointmentsModule(),
            };

            return new DevDataService(db, environment, modules.Concat(extraModules));
        }

        private async Task<Guid> NewTenantAsync()
        {
            Guid id = Guid.NewGuid();
            await using ApplicationDbContext db = _fixture.CreateContext();
            await db.Database.ExecuteSqlRawAsync(
                "INSERT INTO \"HospitalGroups\" (\"Id\", \"Name\", \"IsActive\", \"CreatedAt\") VALUES ({0}, {1}, TRUE, LOCALTIMESTAMP)", id, "Dev data tenant " + id.ToString("N")[..6]);
            return id;
        }

        private static async Task EnsureDoctorRoleAsync(ApplicationDbContext db)
        {
            if (await db.Roles.AnyAsync(r => r.Code == "DOCTOR")) return;
            db.Roles.Add(new Role(Guid.NewGuid(), "Doctor", "DOCTOR", null, null, null));
            await db.SaveSeedChangesAsync();
        }

        /// <summary>Total rows of the tables the generator writes to, for one tenant.</summary>
        private async Task<int> CountRowsAsync(Guid tenantId)
        {
            await using ApplicationDbContext db = _fixture.CreateContext();
            return await db.Hospitals.IgnoreQueryFilters().CountAsync(x => x.TenantId == tenantId)
                + await db.Departments.IgnoreQueryFilters().CountAsync(x => x.TenantId == tenantId)
                + await db.Rooms.IgnoreQueryFilters().CountAsync(x => x.TenantId == tenantId)
                + await db.Users.IgnoreQueryFilters().CountAsync(x => x.TenantId == tenantId)
                + await db.Profiles.IgnoreQueryFilters().CountAsync(x => x.TenantId == tenantId)
                + await db.Doctors.IgnoreQueryFilters().CountAsync(x => x.TenantId == tenantId)
                + await db.DoctorSpecialties.IgnoreQueryFilters().CountAsync(x => x.TenantId == tenantId)
                + await db.HospitalStaffs.IgnoreQueryFilters().CountAsync(x => x.TenantId == tenantId)
                + await db.MedicalServices.IgnoreQueryFilters().CountAsync(x => x.TenantId == tenantId)
                + await db.DoctorSchedules.IgnoreQueryFilters().CountAsync(x => x.TenantId == tenantId)
                + await db.Patients.IgnoreQueryFilters().CountAsync(x => x.TenantId == tenantId)
                + await db.Appointments.IgnoreQueryFilters().CountAsync(x => x.TenantId == tenantId);
        }
    }
}
