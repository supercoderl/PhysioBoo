namespace PhysioBoo.Application.ViewModels.Radiology
{
    public sealed record StudyTimelineEventViewModel(string Stage, DateTime? OccurredAt);

    public sealed record StudyRecordViewModel(
        Guid Id,
        Guid OrderId,
        string OrderNumber,
        string PatientName,
        string Mrn,
        string ExaminationName,
        string ModalityName,
        string BodyPart,
        string? Technique,
        DateTime? StudyDate,
        int ImagesCount,
        string? DicomStudyUid,
        bool IsCritical,
        List<StudyTimelineEventViewModel> Timeline,
        List<Guid> ComparisonStudyIds
    );
}
