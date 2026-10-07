namespace PhysioBoo.Application.ViewModels.Laboratory
{
    public sealed record LabOrderTestViewModel(
        Guid Id,
        string TestName,
        string CategoryName,
        string SampleType
    );

    public sealed record LabOrderRowViewModel(
        Guid Id,
        string OrderNumber,
        string PatientName,
        string Mrn,
        string VisitNumber,
        string DepartmentName,
        string WardName,
        List<LabOrderTestViewModel> Tests,
        string OrderingDoctorName,
        string Priority,
        string CollectionStatus,
        string LabStatus,
        string VerificationStatus,
        DateTime OrderTime
    );
}
