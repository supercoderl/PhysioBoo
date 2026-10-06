namespace PhysioBoo.Application.ViewModels.RevenueReports
{
    public sealed record RevenueReportFilter(
        DateTime Start,
        DateTime End,
        string? Granularity,
        List<Guid>? DepartmentIds,
        List<Guid>? DoctorIds,
        List<string>? PaymentMethods,
        List<Guid>? InsuranceProviderIds,
        string? Search
    );
}
