namespace PhysioBoo.Application.ViewModels.Cashier
{
    public sealed class CashierInvoiceFilter
    {
        public string? Status { get; set; }
        public DateOnly? DateFrom { get; set; }
        public DateOnly? DateTo { get; set; }
        public Guid? DepartmentId { get; set; }
    }
}
