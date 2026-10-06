using PhysioBoo.Domain.Entities.Inpatient;

namespace PhysioBoo.Application.ViewModels.BedMap
{
    public sealed class WardViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
        public int Floor { get; set; }
        public Guid? DepartmentId { get; set; }
        public string? Department { get; set; }
        public int TotalBeds { get; set; }
        public int AvailableBeds { get; set; }
        public int OccupiedBeds { get; set; }
        public int MaintenanceBeds { get; set; }
        public int ReservedBeds { get; set; }

        public static WardViewModel FromEntity(Ward entity)
        {
            return new WardViewModel
            {
                Id = entity.Id,
                Name = entity.Name,
                Code = entity.Code,
                Floor = entity.Floor,
                DepartmentId = entity.DepartmentId,
                Department = entity.Department?.Name
            };
        }
    }
}
