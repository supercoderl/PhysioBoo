using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Infrastructure.Database.DevData
{
    /// <summary>
    /// Doctors and physiotherapists. Each one is a User + Profile + Doctor sharing one id (as CreateDoctor does), holds the
    /// DOCTOR role, works in one department and room of the tenant, and has a primary specialty.
    /// </summary>
    internal sealed class ProvidersModule : IDevDataModule
    {
        public const string ModuleKey = "providers";

        private const string DoctorRoleCode = "DOCTOR";
        private const string EmailDomain = "dev.physioboo.test";

        private static readonly string[] AccreditingBodies = { "State Medical Board", "National Physiotherapy Council", "Regional Health Authority" };

        public string Key => ModuleKey;

        public string Label => "Doctors & physiotherapists";

        public string Description => "Provider accounts with profiles, specialty, department, room and the Doctor role.";

        public IReadOnlyList<string> DependsOn => new[] { HospitalStructureModule.ModuleKey, MasterDataModule.ModuleKey };

        public Task<bool> HasDataAsync(DevDataContext context, CancellationToken ct) =>
            context.Db.Doctors.IgnoreQueryFilters().AnyAsync(d => d.TenantId == context.TenantId && d.DeletedAt == null, ct);

        public async Task GenerateAsync(DevDataContext context, int count, CancellationToken ct)
        {
            List<Department> departments = await context.Db.Departments.IgnoreQueryFilters()
                .Where(d => d.TenantId == context.TenantId && d.DeletedAt == null)
                .OrderBy(d => d.DepartmentCode)
                .ToListAsync(ct);

            if (departments.Count == 0)
            {
                context.Warn("No departments exist, so no doctors were generated.");
                return;
            }

            List<MedicalSpecialty> specialties = await context.Db.MedicalSpecialties.ToListAsync(ct);
            if (specialties.Count == 0)
            {
                context.Warn("No medical specialties exist, so no doctors were generated.");
                return;
            }

            Domain.Entities.Core.Role? doctorRole =await context.Db.Roles.FirstOrDefaultAsync(r => r.Code == DoctorRoleCode, ct);
            if (doctorRole is null)
                context.Warn($"The {DoctorRoleCode} role does not exist (run seed-data.sql); doctors were created without it.");

            Dictionary<Guid, List<Room>> roomsByDepartment = (await context.Db.Rooms.IgnoreQueryFilters()
                    .Where(r => r.TenantId == context.TenantId && r.DeletedAt == null && r.DepartmentId != null)
                    .OrderBy(r => r.RoomNumber)
                    .ToListAsync(ct))
                .GroupBy(r => r.DepartmentId!.Value)
                .ToDictionary(g => g.Key, g => g.ToList());

            int existing = await context.Db.Doctors.IgnoreQueryFilters().CountAsync(d => d.TenantId == context.TenantId, ct);
            DateTime now = context.Now;

            List<User> users = new List<User>(count);
            List<Doctor> doctors = new List<Doctor>(count);
            List<DoctorSpecialty> doctorSpecialties = new List<DoctorSpecialty>(count);
            List<UserRole> userRoles = new List<UserRole>(count);

            for (int i = 0; i < count; i++)
            {
                int sequence = existing + i + 1;
                Department department = departments[i % departments.Count];
                MedicalSpecialty specialty = SpecialtyFor(department, specialties);
                string firstName = context.Faker.FirstName();
                string lastName = context.Faker.LastName();
                string phone = await context.UniquePhoneAsync(ct);
                Guid id = Guid.NewGuid();
                // users.Email is unique across tenants: the id fragment makes a clash impossible.
                string email = $"{firstName}.{lastName}.{id.ToString("N")[..6]}@{EmailDomain}".ToLowerInvariant();

                Profile profile = new Profile(
                    id, firstName, lastName, string.Empty,
                    DateOnly.FromDateTime(now.AddYears(-context.Faker.Between(29, 62)).AddDays(-context.Faker.Between(0, 364))),
                    context.Faker.RandomGender(), context.Faker.RandomBloodGroup(), MaritalStatus.Married,
                    "United States", email, phone,
                    "National ID", $"ID{context.Faker.Between(10000000, 99999999)}", now.AddYears(context.Faker.Between(2, 8)),
                    $"{context.Faker.FirstName()} {lastName}", phone, "Spouse", PreferredCommunication.Email);
                profile.SetTenantId(context.TenantId);

                User user = new User(id, email, phone, context.UnusablePasswordHash);
                user.SetTenantId(context.TenantId);
                user.SetIsVerified(true);
                user.SetEmailVerifiedAt(now);

                int years = context.Faker.Between(3, 30);
                decimal fee = context.Faker.Money(200, 600);

                Doctor doctor = new Doctor(
                    id,
                    $"DOC-{sequence:D4}",
                    $"MLN-{context.TenantCode}-{sequence:D4}",
                    DateOnly.FromDateTime(now.AddYears(context.Faker.Between(1, 6))),
                    context.Faker.Pick(AccreditingBodies),
                    null,
                    $"{specialty.Name} specialist with {years} years of clinical experience.",
                    $"Dr. {lastName} treats patients at {department.Name} and focuses on evidence-based, patient-centred care.",
                    null, null, null, null, null);
                doctor.SetTenantId(context.TenantId);
                doctor.SetDepartmentId(department.Id);
                if (roomsByDepartment.TryGetValue(department.Id, out List<Room>? rooms))
                    doctor.SetRoomId(rooms[(i / departments.Count) % rooms.Count].Id);
                doctor.SetYearsOfExperience(years);
                doctor.SetYearsOfPractice(years);
                doctor.SetConsultationFeeMin(fee);
                doctor.SetConsultationFeeMax(fee * 1.5m);
                doctor.SetFollowUpFee(fee * 0.6m);
                doctor.SetEmergencyConsultationFee(fee * 2m);
                doctor.SetLanguagesSpoken(context.Faker.LanguagesSupported());
                doctor.SetIsAvailableOnline(context.Faker.Chance(0.4));
                doctor.SetConsultationDuration(30);
                doctor.SetCancellationPolicy("Free cancellation up to 24 hours before the appointment.");
                doctor.SetPaymentMethods(new[] { "Cash", "Card", "Bank Transfer" });
                doctor.SetJoiningDate(now.AddYears(-Math.Min(years, 8)));
                doctor.SetEmploymentStatus(EmploymentStatus.Active);
                doctor.SetIsVerified(true);
                doctor.SetIsFeatured(context.Faker.Chance(0.2));
                doctor.SetAverageRating(Math.Round(4m + context.Faker.Between(0, 10) / 10m, 1));

                user.CreateDoctor(profile, doctor);
                users.Add(user);
                doctors.Add(doctor);

                DoctorSpecialty doctorSpecialty = new DoctorSpecialty(
                    Guid.NewGuid(), id, specialty.Id,
                    $"CERT-{context.TenantCode}-{sequence:D4}",
                    DateOnly.FromDateTime(now.AddYears(-Math.Min(years, 10))),
                    DateOnly.FromDateTime(now.AddYears(5)));
                doctorSpecialty.SetTenantId(context.TenantId);
                doctorSpecialty.SetIsPrimary(true);
                doctorSpecialty.SetProficiencyLevel(years >= 15 ? ProficiencyLevel.Expert : years >= 8 ? ProficiencyLevel.Advanced : ProficiencyLevel.Intermediate);
                doctorSpecialty.SetYearsOfExperience(years);
                doctorSpecialties.Add(doctorSpecialty);

                if (doctorRole is not null)
                    userRoles.Add(new UserRole(Guid.NewGuid(), id, doctorRole.Id, null));
            }

            // Doctor.PrimarySpecialtyId points at a DoctorSpecialty row, which itself points at the Doctor: the doctor goes
            // in first without it, and the link is set once the specialty rows exist.
            context.Db.Users.AddRange(users);
            context.Db.UserRoles.AddRange(userRoles);
            await context.SaveAsync(ct);

            context.Db.DoctorSpecialties.AddRange(doctorSpecialties);
            await context.SaveAsync(ct);

            for (int i = 0; i < doctors.Count; i++)
                doctors[i].SetPrimarySpecialtyId(doctorSpecialties[i].Id);
            await context.SaveAsync(ct);

            context.Count("doctors", doctors.Count);
            context.Count("users", users.Count);
            context.Count("doctorSpecialties", doctorSpecialties.Count);
        }

        /// <summary>Department first words whose specialty has a different name.</summary>
        private static readonly Dictionary<string, string> SpecialtyAliases = new(StringComparer.OrdinalIgnoreCase)
        {
            ["Laboratory"] = "Pathology",
            ["Surgery"] = "General Surgery",
            ["Intensive"] = "Critical Care",
            ["Emergency"] = "Emergency Medicine",
        };

        /// <summary>The specialty named like the department ("Physiotherapy 2" matches Physiotherapy), else any specialty.</summary>
        private static MedicalSpecialty SpecialtyFor(Department department, IReadOnlyList<MedicalSpecialty> specialties)
        {
            string key = FirstWord(department.Name);
            if (SpecialtyAliases.TryGetValue(key, out string? alias)) key = alias;

            return specialties.FirstOrDefault(s => s.Name.StartsWith(key, StringComparison.OrdinalIgnoreCase))
                ?? specialties[department.Name.Sum(c => c) % specialties.Count];
        }

        private static string FirstWord(string name)
        {
            int space = name.IndexOf(' ');
            return space < 0 ? name : name[..space];
        }
    }
}
