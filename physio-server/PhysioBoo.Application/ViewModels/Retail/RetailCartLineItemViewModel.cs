namespace PhysioBoo.Application.ViewModels.Retail
{
    public sealed class RetailCartLineItemViewModel
    {
        public Guid Id { get; set; }
        public Guid MedicineId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? GenericName { get; set; }
        public string? Strength { get; set; }
        public string Unit { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal DiscountPercent { get; set; }
        public decimal InsuranceCoveredAmount { get; set; }
        public decimal Total { get; set; }
    }
}
