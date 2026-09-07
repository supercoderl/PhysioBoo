namespace PhysioBoo.Application.ViewModels.Retail
{
    public class RetailMedicineCardViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? GenericName { get; set; }
        public string? Strength { get; set; }
        public string? PackageLabel { get; set; }
        public string? Category { get; set; }
        public string? Manufacturer { get; set; }
        public string? BatchNo { get; set; }
        public DateOnly? ExpiryDate { get; set; }
        public string? Barcode { get; set; }
        public int Stock { get; set; }
        public decimal Price { get; set; }
        public decimal? Mrp { get; set; }
        public bool InsuranceCovered { get; set; }
        public bool IsFavorite { get; set; }
        public bool IsRecentlySold { get; set; }
    }
}
