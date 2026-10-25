using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Infrastructure.Database.DevData
{
    /// <summary>
    /// Hospital staff roster (nurses, receptionists, technicians, ...). A HospitalStaff row has no user account in this
    /// domain, so none is created; each person belongs to one department and its branch.
    /// </summary>
    internal sealed class StaffModule : IDevDataModule
    {
        public const string ModuleKey = "staff";

        private sealed record StaffTemplate(StaffType Type, string Position, string[] DepartmentHints, int Salary);

        private static readonly StaffTemplate[] Templates =
        {
            new(StaffType.Nurse, "Registered nurse", new[] { "Emergency", "Intensive", "Cardiology", "Neurology" }, 1800),
            new(StaffType.Receptionist, "Front desk receptionist", new[] { "Physiotherapy", "Pediatrics", "Dermatology" }, 1100),
            new(StaffType.Physiotherapy, "Physiotherapy assistant", new[] { "Physiotherapy", "Orthopedics" }, 1500),
            new(StaffType.Laboratory, "Laboratory technician", new[] { "Laboratory" }, 1600),
            new(StaffType.Radiology, "Radiology technician", new[] { "Radiology" }, 1700),
            new(StaffType.Pharmacist, "Clinical pharmacist", new[] { "Cardiology", "Surgery" }, 2200),
            new(StaffType.Nurse, "Ward nurse", new[] { "Surgery", "Orthopedics", "Pediatrics" }, 1750),
            new(StaffType.Admin, "Clinic administrator", new[] { "Physiotherapy", "Ophthalmology" }, 1900),
        };

        private static readonly string[] ShiftPatterns = { "Day 07:00-15:00", "Evening 15:00-23:00", "Office 08:00-17:00" };

        public string Key => ModuleKey;

        public string Label => "Hospital staff";

        public string Description => "Nurses, receptionists, technicians and other staff assigned to departments.";

        public IReadOnlyList<string> DependsOn => new[] { HospitalStructureModule.ModuleKey };

        public Task<bool> HasDataAsync(DevDataContext context, CancellationToken ct) =>
            context.Db.HospitalStaffs.IgnoreQueryFilters().AnyAsync(s => s.TenantId == context.TenantId && s.DeletedAt == null, ct);

        public async Task GenerateAsync(DevDataContext context, int count, CancellationToken ct)
        {
            List<Department> departments = await context.Db.Departments.IgnoreQueryFilters()
                .Where(d => d.TenantId == context.TenantId && d.DeletedAt == null)
                .OrderBy(d => d.DepartmentCode)
                .ToListAsync(ct);

            if (departments.Count == 0)
            {
                context.Warn("No departments exist, so no staff were generated.");
                return;
            }

            int existing = await context.Db.HospitalStaffs.IgnoreQueryFilters().CountAsync(s => s.TenantId == context.TenantId, ct);
            List<HospitalStaff> staff = new List<HospitalStaff>(count);

            for (int i = 0; i < count; i++)
            {
                StaffTemplate template = Templates[i % Templates.Length];
                // Spread over every department matching the role, falling back to any department.
                List<Department> matches = departments.Where(d => template.DepartmentHints.Any(h => d.Name.StartsWith(h, StringComparison.OrdinalIgnoreCase))).ToList();
                Department department = matches.Count > 0
                    ? matches[(i / Templates.Length) % matches.Count]
                    : departments[i % departments.Count];

                HospitalStaff member = new HospitalStaff(
                    Guid.NewGuid(),
                    $"STF-{context.TenantCode}-{existing + i + 1:D4}",
                    department.HospitalId,
                    department.Id,
                    template.Type,
                    template.Position,
                    i % 7 == 0 ? EmploymentType.Parttime : EmploymentType.Fulltime,
                    template.Salary + context.Faker.Between(0, 5) * 100,
                    null,
                    null,
                    null,
                    context.Faker.Pick(ShiftPatterns),
                    null,
                    $"{context.Faker.FirstName()} {context.Faker.LastName()}",
                    context.Faker.Phone(),
                    null,
                    null,
                    null,
                    null,
                    null,
                    null);
                member.SetTenantId(context.TenantId);
                staff.Add(member);
            }

            context.Db.HospitalStaffs.AddRange(staff);
            await context.SaveAsync(ct);
            context.Count("staff", staff.Count);
        }
    }
}
