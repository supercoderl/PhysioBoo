namespace PhysioBoo.Application.ViewModels.Laboratory
{
    public sealed record LabPatientResultSummaryViewModel(
        Guid PatientId,
        string FullName,
        string Mrn,
        string VisitNumber,
        string DepartmentName
    );
}
