namespace PhysioBoo.Application.ViewModels.Radiology
{
    public sealed record ImagingExaminationViewModel(
        Guid Id,
        string ExaminationName,
        string ModalityName,
        string BodyPart
    );

    public sealed record ImagingOrderRowViewModel(
        Guid Id,
        string OrderNumber,
        string PatientName,
        string Mrn,
        string VisitNumber,
        string DepartmentName,
        string WardName,
        List<ImagingExaminationViewModel> Examinations,
        string OrderingDoctorName,
        string Priority,
        DateTime? ScheduledTime,
        string Status,
        string ReportStatus,
        string? RadiologistName,
        string? TechnicianName,
        DateTime OrderTime
    );
}
