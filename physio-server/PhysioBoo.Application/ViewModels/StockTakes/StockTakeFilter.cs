namespace PhysioBoo.Application.ViewModels.StockTakes
{
    public sealed class StockTakeFilter
    {
        public Guid? WarehouseId { get; set; } // HospitalId
        public Guid? DepartmentId { get; set; }
        public string? Status { get; set; }
        public DateOnly? DateFrom { get; set; }
        public DateOnly? DateTo { get; set; }
    }
}
