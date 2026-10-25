using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Infrastructure.Database.DevData
{
    /// <summary>
    /// Patients with demographics, an optional insurance policy and a primary doctor of the same tenant. A patient has no
    /// user account (Patient.UserId is optional), so none is created.
    /// </summary>
    internal sealed class PatientsModule : IDevDataModule
    {
        public const string ModuleKey = "patients";

        private static readonly string[] Occupations = { "Teacher", "Office worker", "Nurse", "Driver", "Engineer", "Retired", "Student", "Shop owner", "Builder", "Accountant" };
        private static readonly string[] ChronicHistories = { "Chronic lower back pain", "Type 2 diabetes", "Hypertension", "Osteoarthritis of the knee", "Asthma" };
        private static readonly string[] Allergies = { "Penicillin", "Latex", "Pollen", "Shellfish" };
        private static readonly string[] Relationships = { "Spouse", "Parent", "Sibling", "Child", "Friend" };
        private static readonly string[] AppointmentTimes = { "Morning", "Afternoon", "Evening" };

        public string Key => ModuleKey;

        public string Label => "Patients";

        public string Description => "Patient profiles with a primary doctor, preferred branch and optional insurance.";

        public IReadOnlyList<string> DependsOn => new[] { ProvidersModule.ModuleKey };

        public Task<bool> HasDataAsync(DevDataContext context, CancellationToken ct) =>
            context.Db.Patients.IgnoreQueryFilters().AnyAsync(p => p.TenantId == context.TenantId && p.DeletedAt == null, ct);

        public async Task GenerateAsync(DevDataContext context, int count, CancellationToken ct)
        {
            List<Doctor> doctors = await context.Db.Doctors.IgnoreQueryFilters()
                .Where(d => d.TenantId == context.TenantId && d.DeletedAt == null && d.DepartmentId != null)
                .ToListAsync(ct);

            if (doctors.Count == 0)
            {
                context.Warn("No doctors exist, so no patients were generated (every patient needs a primary doctor).");
                return;
            }

            Dictionary<Guid, Guid> hospitalByDepartment = await context.Db.Departments.IgnoreQueryFilters()
                .Where(d => d.TenantId == context.TenantId && d.DeletedAt == null)
                .ToDictionaryAsync(d => d.Id, d => d.HospitalId, ct);

            int existing = await context.Db.Patients.IgnoreQueryFilters().CountAsync(p => p.TenantId == context.TenantId, ct);
            DateTime now = context.Now;

            List<Profile> profiles = new List<Profile>(count);
            List<Patient> patients = new List<Patient>(count);

            for (int i = 0; i < count; i++)
            {
                Doctor doctor = doctors[i % doctors.Count];
                Guid hospitalId = hospitalByDepartment[doctor.DepartmentId!.Value];
                string firstName = context.Faker.FirstName();
                string lastName = context.Faker.LastName();
                int age = context.Faker.Between(6, 85);
                bool chronic = age > 45 && context.Faker.Chance(0.35);
                bool insured = context.Faker.Chance(0.6);
                string phone = context.Faker.Phone();

                Profile profile = new Profile(
                    Guid.NewGuid(), firstName, lastName, string.Empty,
                    DateOnly.FromDateTime(now.AddYears(-age).AddDays(-context.Faker.Between(0, 364))),
                    context.Faker.RandomGender(), context.Faker.RandomBloodGroup(),
                    age < 18 ? MaritalStatus.Single : context.Faker.Chance(0.6) ? MaritalStatus.Married : MaritalStatus.Single,
                    "United States", context.Faker.Email($"{firstName}.{lastName}"), phone,
                    null, null, null,
                    $"{context.Faker.FirstName()} {lastName}", context.Faker.Phone(), context.Faker.Pick(Relationships),
                    PreferredCommunication.Email);
                profile.SetTenantId(context.TenantId);

                Patient patient = new Patient(
                    Guid.NewGuid(),
                    $"PAT-{context.TenantCode}-{existing + i + 1:D5}",
                    null,
                    profile.Id,
                    doctor.Id,
                    null,
                    null,
                    insured ? context.Faker.Pick(new[] { "Aurora Health", "BlueLeaf", "Summit Care", "Unity Mutual" }) : null,
                    insured ? $"POL-{context.Faker.Between(100000, 999999)}" : null,
                    insured ? DateOnly.FromDateTime(now.AddYears(1).AddDays(context.Faker.Between(0, 300))) : null,
                    insured ? context.Faker.Money(5000, 20000) : null,
                    chronic ? context.Faker.Pick(ChronicHistories) : null,
                    null,
                    null,
                    context.Faker.Chance(0.15) ? context.Faker.Pick(Allergies) : null,
                    null,
                    null,
                    age >= 18 && age < 70 ? context.Faker.Pick(Occupations) : age < 18 ? "Student" : "Retired",
                    null,
                    hospitalId,
                    doctor.Id,
                    context.Faker.Pick(AppointmentTimes),
                    "{\"email\":true,\"sms\":false}",
                    null,
                    null);
                patient.SetTenantId(context.TenantId);
                patient.SetIsChronicPatient(chronic);
                patient.SetRiskLevel(chronic ? RiskLevel.Medium : RiskLevel.Low);

                DateTime registered = now.Date.AddDays(-context.Faker.Between(0, 365));
                patient.SetRegistrationDate(DateOnly.FromDateTime(registered));
                profile.SetCreatedAt(registered);
                patient.SetCreatedAt(registered);

                profiles.Add(profile);
                patients.Add(patient);
            }

            context.Db.Profiles.AddRange(profiles);
            context.Db.Patients.AddRange(patients);
            await context.SaveAsync(ct);

            context.Count("patients", patients.Count);
        }
    }
}
