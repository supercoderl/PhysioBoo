using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Infrastructure.Database.DevData
{
    /// <summary>
    /// The service catalogue. Every service is Active (so the public website lists it), belongs to the branch of its
    /// department, is linked to that department, and is delivered by the doctors who work there.
    /// </summary>
    internal sealed class MedicalServicesModule : IDevDataModule
    {
        public const string ModuleKey = "medical-services";

        private sealed record ServiceTemplate(string Name, string ShortName, string Department, string Description, int Price, int Minutes, bool Referral);

        private static readonly ServiceTemplate[] Templates =
        {
            new("Initial Physiotherapy Assessment", "Physio assessment", "Physiotherapy", "A full movement, strength and pain assessment with a personal treatment plan.", 60, 60, false),
            new("Manual Therapy Session", "Manual therapy", "Physiotherapy", "Hands-on joint and soft-tissue treatment to restore mobility and reduce pain.", 45, 45, false),
            new("Therapeutic Ultrasound", "Ultrasound therapy", "Physiotherapy", "Deep-tissue ultrasound for tendon, ligament and muscle recovery.", 35, 30, false),
            new("Sports Injury Rehabilitation", "Sports rehab", "Physiotherapy", "A structured return-to-sport programme after muscle, ligament or joint injury.", 55, 60, false),
            new("Cardiac Consultation", "Cardiac consult", "Cardiology", "Specialist review of heart symptoms, risk factors and test results.", 90, 40, false),
            new("Electrocardiogram (ECG)", "ECG", "Cardiology", "A resting 12-lead ECG with a same-day report.", 40, 20, false),
            new("Orthopedic Consultation", "Ortho consult", "Orthopedics", "Diagnosis and treatment advice for bone, joint and spine problems.", 80, 30, false),
            new("Post-surgical Fracture Review", "Fracture review", "Orthopedics", "A follow-up review of healing, X-rays and the rehabilitation plan.", 65, 30, true),
            new("Neurological Examination", "Neuro exam", "Neurology", "A complete nervous-system examination for headaches, numbness and dizziness.", 95, 45, false),
            new("Pediatric Check-up", "Child check-up", "Pediatrics", "Growth, development and vaccination review for children.", 50, 30, false),
            new("Skin Assessment", "Skin assessment", "Dermatology", "Examination of moles, rashes and skin conditions, with dermatoscopy.", 70, 30, false),
            new("Comprehensive Eye Exam", "Eye exam", "Ophthalmology", "Vision, eye-pressure and retina checks with a prescription if needed.", 60, 40, false),
            new("X-ray Imaging", "X-ray", "Radiology", "Digital X-ray of the chest, limbs or spine with a radiologist report.", 55, 20, true),
            new("Blood Panel", "Blood panel", "Laboratory", "A routine blood panel covering blood count, glucose and lipids.", 45, 15, false),
            new("Minor Surgical Procedure", "Minor surgery", "Surgery", "Day-case minor surgery under local anaesthetic.", 250, 60, true),
            new("Emergency Assessment", "Emergency", "Emergency", "Immediate triage and treatment of urgent conditions.", 120, 30, false),
        };

        public string Key => ModuleKey;

        public string Label => "Medical services";

        public string Description => "Published services, linked to their departments and the doctors who deliver them.";

        public IReadOnlyList<string> DependsOn => new[] { ProvidersModule.ModuleKey };

        public Task<bool> HasDataAsync(DevDataContext context, CancellationToken ct) =>
            context.Db.MedicalServices.IgnoreQueryFilters().AnyAsync(s => s.TenantId == context.TenantId && s.DeletedAt == null, ct);

        public async Task GenerateAsync(DevDataContext context, int count, CancellationToken ct)
        {
            List<Department> departments = await context.Db.Departments.IgnoreQueryFilters()
                .Where(d => d.TenantId == context.TenantId && d.DeletedAt == null)
                .OrderBy(d => d.DepartmentCode)
                .ToListAsync(ct);

            List<Doctor> doctors = await context.Db.Doctors.IgnoreQueryFilters()
                .Where(d => d.TenantId == context.TenantId && d.DeletedAt == null && d.DepartmentId != null)
                .ToListAsync(ct);

            if (departments.Count == 0)
            {
                context.Warn("No departments exist, so no services were generated.");
                return;
            }

            int existing = await context.Db.MedicalServices.IgnoreQueryFilters().CountAsync(s => s.TenantId == context.TenantId, ct);
            List<MedicalService> services = new List<MedicalService>(count);

            for (int i = 0; i < count; i++)
            {
                ServiceTemplate template = Templates[i % Templates.Length];
                int round = i / Templates.Length;

                // The branch hosting this department. Round 2 and later use the next matching department so every branch gets services.
                List<Department> matches = departments.Where(d => d.Name.StartsWith(template.Department, StringComparison.OrdinalIgnoreCase)).ToList();
                if (matches.Count == 0) matches = departments;
                Department department = matches[round % matches.Count];

                List<Guid> doctorIds = doctors.Where(d => d.DepartmentId == department.Id).Select(d => d.Id).ToList();

                MedicalService service = new MedicalService(
                    Guid.NewGuid(),
                    $"SVC-{existing + i + 1:D4}",
                    round == 0 ? template.Name : $"{template.Name} ({round + 1})",
                    template.ShortName,
                    template.Description,
                    ServiceStatus.Active,
                    ServiceAvailability.Available,
                    template.Price * 1000m,
                    "VND",
                    true,
                    template.Minutes,
                    true,
                    template.Referral,
                    doctorIds.Count > 0 ? doctorIds[0] : null,
                    department.HospitalId,
                    null,
                    System.Text.Json.JsonSerializer.Serialize(new[] { template.Department.ToLowerInvariant(), template.ShortName.ToLowerInvariant() }));
                service.SetTenantId(context.TenantId);
                service.ReplaceDepartments(new[] { department.Id });
                service.ReplaceDoctors(doctorIds);

                services.Add(service);
            }

            context.Db.MedicalServices.AddRange(services);
            await context.SaveAsync(ct);

            context.Count("services", services.Count);

            if (doctors.Count == 0)
                context.Warn("The tenant has no doctors yet, so the services have no one assigned to deliver them.");
        }
    }
}
