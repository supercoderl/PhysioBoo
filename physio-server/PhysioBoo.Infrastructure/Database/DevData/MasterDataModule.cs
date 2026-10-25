using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Entities.Operation;

namespace PhysioBoo.Infrastructure.Database.DevData
{
    /// <summary>
    /// Medical specialties and appointment types. Both are global reference data (no tenant) owned by Super Admin,
    /// so this module only fills a table that is completely empty; it never adds to or edits rows someone created.
    /// </summary>
    internal sealed class MasterDataModule : IDevDataModule
    {
        public const string ModuleKey = "master-data";

        /// <summary>Specialty names are matched by prefix to the department templates of <see cref="HospitalStructureModule"/>.</summary>
        public static readonly IReadOnlyList<(string Name, string Code, string Category, bool Surgical, bool Diagnostic)> Specialties = new[]
        {
            ("Physiotherapy", "PHY", "Rehabilitation", false, false),
            ("Cardiology", "CAR", "Internal medicine", false, false),
            ("Orthopedics", "ORT", "Surgical", true, false),
            ("Neurology", "NEU", "Internal medicine", false, false),
            ("Emergency Medicine", "EME", "Acute care", false, false),
            ("Radiology", "RAD", "Diagnostic", false, true),
            ("Pathology", "PAT", "Diagnostic", false, true),
            ("General Surgery", "SUR", "Surgical", true, false),
            ("Pediatrics", "PED", "Primary care", false, false),
            ("Critical Care", "ICU", "Acute care", false, false),
            ("Dermatology", "DER", "Outpatient", false, false),
            ("Ophthalmology", "OPH", "Outpatient", false, false),
        };

        private static readonly (string Name, string Code, string Color, int Minutes, int Buffer, bool FollowUp, bool Emergency)[] AppointmentTypes =
        {
            ("Initial consultation", "INITIAL", "#2563EB", 45, 15, false, false),
            ("Follow-up visit", "FOLLOWUP", "#16A34A", 30, 10, true, false),
            ("Physiotherapy session", "PHYSIO", "#7C3AED", 45, 10, false, false),
            ("Routine check-up", "CHECKUP", "#0891B2", 30, 10, false, false),
            ("Urgent visit", "URGENT", "#DC2626", 30, 5, false, true),
        };

        public string Key => ModuleKey;

        public string Label => "Reference data";

        public string Description => "Medical specialties and appointment types (shared by all tenants), only if their tables are empty.";

        public IReadOnlyList<string> DependsOn => Array.Empty<string>();

        public async Task<bool> HasDataAsync(DevDataContext context, CancellationToken ct) =>
            await context.Db.MedicalSpecialties.AnyAsync(ct) && await context.Db.AppointmentTypes.AnyAsync(ct);

        public async Task GenerateAsync(DevDataContext context, int count, CancellationToken ct)
        {
            if (!await context.Db.MedicalSpecialties.AnyAsync(ct))
            {
                List<MedicalSpecialty> specialties = Specialties.Select(t =>
                {
                    MedicalSpecialty specialty = new MedicalSpecialty(Guid.NewGuid(), t.Name, t.Code, t.Category, $"{t.Name} care and treatment.", null, null, null);
                    specialty.SetIsSurgical(t.Surgical);
                    specialty.SetIsDiagnostic(t.Diagnostic);
                    return specialty;
                }).ToList();

                context.Db.MedicalSpecialties.AddRange(specialties);
                context.Count("specialties", specialties.Count);
            }
            else
            {
                context.Reuse("specialties");
            }

            if (!await context.Db.AppointmentTypes.AnyAsync(ct))
            {
                List<AppointmentType> types = AppointmentTypes.Select(t =>
                {
                    AppointmentType type = new AppointmentType(Guid.NewGuid(), t.Name, t.Code, $"{t.Name} at the clinic.", null, t.Color);
                    type.SetDefaultDuration(t.Minutes);
                    type.SetBufferTime(t.Buffer);
                    type.SetIsFollowUp(t.FollowUp);
                    type.SetIsEmergency(t.Emergency);
                    return type;
                }).ToList();

                context.Db.AppointmentTypes.AddRange(types);
                context.Count("appointmentTypes", types.Count);
            }
            else
            {
                context.Reuse("appointmentTypes");
            }

            await context.SaveAsync(ct);
        }
    }
}
