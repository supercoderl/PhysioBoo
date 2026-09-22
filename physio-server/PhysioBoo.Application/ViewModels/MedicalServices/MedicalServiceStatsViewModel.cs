namespace PhysioBoo.Application.ViewModels.MedicalServices
{
    public sealed class MedicalServiceStatsViewModel
    {
        public int TotalServices { get; set; }
        public int ActiveServices { get; set; }
        public decimal AveragePrice { get; set; }
        public string AveragePriceCurrency { get; set; } = "VND";
        public MostUsedDepartmentViewModel? MostUsedDepartment { get; set; }
    }

    public sealed class MostUsedDepartmentViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int ServiceCount { get; set; }
    }
}
