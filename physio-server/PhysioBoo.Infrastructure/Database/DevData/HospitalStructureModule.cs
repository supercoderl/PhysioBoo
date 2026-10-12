using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Infrastructure.Database.DevData
{
    /// <summary>
    /// Departments (the primary rows), each with a few rooms, spread over the tenant's branches.
    /// A tenant with no branch gets some first, because a department cannot exist without one.
    /// </summary>
    internal sealed class HospitalStructureModule : IDevDataModule
    {
        public const string ModuleKey = "hospital-structure";

        private const int MaxNewBranches = 5;
        private const int RoomsPerDepartment = 2;
        private const string OperationHoursJson = "{\"weekdays\":\"08:00-17:00\",\"saturday\":\"08:00-12:00\"}";

        private static readonly string[] Wings = { "A", "B", "C" };
        private static readonly string[] BranchSuffixes = { "Rehabilitation Center", "Physio Clinic", "General Hospital" };

        private sealed record DepartmentTemplate(string Name, RoomType RoomType, bool Emergency, bool CriticalCare, bool InPatient, string EquipmentJson);

        private static readonly DepartmentTemplate[] Templates =
        {
            new("Physiotherapy", RoomType.Therapy, false, false, false, "[\"Treatment table\",\"Ultrasound therapy\",\"TENS unit\"]"),
            new("Cardiology", RoomType.Examination, false, false, true, "[\"ECG\",\"Echocardiography\"]"),
            new("Orthopedics", RoomType.Examination, false, false, true, "[\"X-ray viewer\",\"Cast cutter\"]"),
            new("Neurology", RoomType.Examination, false, false, true, "[\"EEG\",\"Reflex hammer set\"]"),
            new("Emergency", RoomType.Emergency, true, true, true, "[\"Defibrillator\",\"Ventilator\"]"),
            new("Radiology", RoomType.Radiology, false, false, false, "[\"X-ray\",\"MRI\"]"),
            new("Laboratory", RoomType.Laboratory, false, false, false, "[\"Centrifuge\",\"Analyzer\"]"),
            new("Surgery", RoomType.Surgery, false, true, true, "[\"Operating table\",\"Anesthesia machine\"]"),
            new("Pediatrics", RoomType.Consultation, false, false, true, "[\"Infant scale\",\"Otoscope\"]"),
            new("Intensive Care", RoomType.Icu, false, true, true, "[\"Ventilator\",\"Patient monitor\"]"),
            new("Dermatology", RoomType.Consultation, false, false, false, "[\"Dermatoscope\"]"),
            new("Ophthalmology", RoomType.Examination, false, false, false, "[\"Slit lamp\"]"),
        };

        public string Key => ModuleKey;

        public string Label => "Hospital structure";

        public string Description => "Branches, departments and rooms.";

        public IReadOnlyList<string> DependsOn => Array.Empty<string>();

        public Task<bool> HasDataAsync(DevDataContext context, CancellationToken ct) =>
            context.Db.Departments.IgnoreQueryFilters()
                .AnyAsync(d => d.TenantId == context.TenantId && d.DeletedAt == null, ct);

        public async Task GenerateAsync(DevDataContext context, int count, CancellationToken ct)
        {
            List<Hospital> hospitals = await context.Db.Hospitals.IgnoreQueryFilters()
                .Where(h => h.TenantId == context.TenantId && h.DeletedAt == null && h.IsActive)
                .ToListAsync(ct);

            if (hospitals.Count == 0)
            {
                hospitals = CreateBranches(context, Math.Clamp((int)Math.Ceiling(count / 10.0), 1, MaxNewBranches));
                context.Db.Hospitals.AddRange(hospitals);
                await context.SaveAsync(ct);
                context.Count("branches", hospitals.Count);
            }

            int existingDepartments = await context.Db.Departments.IgnoreQueryFilters()
                .CountAsync(d => d.TenantId == context.TenantId, ct);

            Dictionary<Guid, HashSet<string>> takenRoomNumbers = (await context.Db.Rooms.IgnoreQueryFilters()
                    .Where(r => r.TenantId == context.TenantId)
                    .Select(r => new { r.HospitalId, r.RoomNumber })
                    .ToListAsync(ct))
                .GroupBy(r => r.HospitalId)
                .ToDictionary(g => g.Key, g => g.Select(r => r.RoomNumber).ToHashSet());

            List<Department> departments = new List<Department>(count);
            List<Room> rooms = new List<Room>(count * RoomsPerDepartment);

            for (int i = 0; i < count; i++)
            {
                int sequence = existingDepartments + i;
                DepartmentTemplate template = Templates[sequence % Templates.Length];
                int round = sequence / Templates.Length;
                Hospital hospital = hospitals[i % hospitals.Count];
                int floor = context.Faker.Between(1, 8);
                string wing = context.Faker.Pick(Wings);

                Department department = new Department(
                    Guid.NewGuid(),
                    hospital.Id,
                    round == 0 ? template.Name : $"{template.Name} {round + 1}",
                    $"DEP-{sequence + 1:D4}",
                    $"{template.Name} services of {hospital.Name}.",
                    null,
                    floor,
                    wing,
                    context.Faker.Phone(),
                    context.Faker.Email(template.Name),
                    context.Faker.Money(50, 500),
                    OperationHoursJson,
                    template.EquipmentJson
                );
                department.TenantId = context.TenantId;
                department.SetIsEmergency(template.Emergency);
                department.SetIsCriticalCare(template.CriticalCare);
                department.SetIsInPatient(template.InPatient);
                department.SetBedCount(template.InPatient ? context.Faker.Between(8, 40) : 0);
                departments.Add(department);

                if (!takenRoomNumbers.TryGetValue(hospital.Id, out HashSet<string>? taken))
                {
                    taken = new HashSet<string>();
                    takenRoomNumbers[hospital.Id] = taken;
                }

                for (int r = 0; r < RoomsPerDepartment; r++)
                {
                    string roomNumber = NextRoomNumber(taken);
                    Room room = new Room(
                        Guid.NewGuid(),
                        hospital.Id,
                        department.Id,
                        roomNumber,
                        $"{template.Name} room {roomNumber}",
                        template.RoomType,
                        floor,
                        wing,
                        template.InPatient ? context.Faker.Between(2, 6) : 1
                    );
                    room.TenantId = context.TenantId;
                    rooms.Add(room);
                }
            }

            context.Db.Departments.AddRange(departments);
            context.Db.Rooms.AddRange(rooms);
            await context.SaveAsync(ct);

            context.Count("departments", departments.Count);
            context.Count("rooms", rooms.Count);
        }

        private static List<Hospital> CreateBranches(DevDataContext context, int count)
        {
            List<Hospital> branches = new List<Hospital>(count);

            for (int i = 0; i < count; i++)
            {
                string city = context.Faker.City();
                string name = $"{city} {BranchSuffixes[i % BranchSuffixes.Length]}";
                HospitalType type = name.Contains("Clinic") ? HospitalType.Clinic
                    : name.Contains("Rehabilitation") ? HospitalType.Rehabilitation
                    : HospitalType.General;

                Hospital branch = new Hospital(
                    Guid.NewGuid(),
                    name,
                    $"HSP-{context.Faker.Between(1000, 9999)}",
                    type,
                    context.Faker.Between(5, 30),
                    context.Faker.Between(0, 4),
                    context.Faker.Street(),
                    city,
                    context.Faker.Province(),
                    context.Faker.PostalCode(),
                    "United States",
                    context.Faker.Phone(),
                    null,
                    context.Faker.Email(city),
                    null,
                    context.Faker.Phone(),
                    context.Faker.Phone(),
                    context.Faker.Latitude(),
                    context.Faker.Longitude(),
                    TimeZoneHelper.GetLocalTimeNow().AddYears(-context.Faker.Between(3, 30)),
                    $"LIC-{context.Faker.Between(100000, 999999)}",
                    TimeZoneHelper.GetLocalTimeNow().AddYears(context.Faker.Between(1, 5)),
                    "Joint Commission International",
                    TimeZoneHelper.GetLocalTimeNow().AddYears(context.Faker.Between(1, 3)),
                    context.Faker.InsuranceAccepted(),
                    context.Faker.LanguagesSupported(),
                    null,
                    "{\"weekdays\":\"07:00-19:00\",\"weekend\":\"08:00-14:00\"}",
                    null,
                    null,
                    $"{name}: outpatient rehabilitation and physiotherapy.",
                    null,
                    null
                );
                branch.SetTenantId(context.TenantId);
                branches.Add(branch);
            }

            return branches;
        }

        private static string NextRoomNumber(HashSet<string> taken)
        {
            int n = taken.Count + 1;
            while (!taken.Add($"R{n:D3}")) n++;
            return $"R{n:D3}";
        }
    }
}
