using PhysioBoo.Domain.Entities.Core;

using PhysioBoo.Domain.Entities.PatientInformation;



namespace PhysioBoo.Domain.Entities.LaboratoryImaging
{
    public class ImagingReport : TenantEntity
    {
        #region Core Imaging Report Table (27)
        public string ReportNumber { get; private set; }
        public Guid ImagingOrderId { get; private set; }
        public Guid PatientId { get; private set; }
        public DateOnly StudyDate { get; private set; }
        public TimeOnly StudyTime { get; private set; }
        public Guid? RadiologistId { get; private set; }
        public string? Technique { get; private set; }
        public string? Findings { get; private set; }
        public string? Impression { get; private set; }
        public string? Recommendations { get; private set; }
        public string? ComparisonStudies { get; private set; }
        public string? Limitations { get; private set; }
        public string? CriticalFindings { get; private set; }
        public bool IsCritical { get; private set; }
        public bool IsNormal { get; private set; }
        public bool IsFinal { get; private set; }
        public bool IsAmended { get; private set; }
        public string? AmendmentReason { get; private set; }
        public DateTime? DictatedAt { get; private set; }
        public DateTime? TranscribedAt { get; private set; }
        public DateTime? VerifiedAt { get; private set; }
        public ReportStatus Status { get; private set; }
        public int ImagesCount { get; private set; }
        public string? DicomStudyUid { get; private set; }
        public string? ReportPdfUrl { get; private set; }
        public string? ImagesUrl { get; private set; }

        // Radiology workspace reporting workflow
        public string? ClinicalIndication { get; private set; }
        public RadiologyReportStatus WorkflowStatus { get; private set; }
        public Guid? VerifierId { get; private set; }
        public DateTime? ReleasedAt { get; private set; }
        public string? RejectionReason { get; private set; }
        public DateTime? LastSavedAt { get; private set; }

        public virtual User? Creator { get; private set; }
        public virtual User? Updater { get; private set; }
        public virtual ImagingOrder? ImagingOrder { get; private set; }
        public virtual Patient? Patient { get; private set; }
        public virtual User? Radiologist { get; private set; }
        public virtual User? Verifier { get; private set; }
        public virtual HospitalGroup? HospitalGroup { get; private set; }
        #endregion

        #region Constructor (27)
        public ImagingReport(
            Guid id,
            string reportNumber,
            Guid imagingOrderId,
            Guid patientId,
            Guid? radiologistId,
            string? technique,
            string? findings,
            string? impression,
            string? recommendations,
            string? comparisonStudies,
            string? limitations,
            string? criticalFindings,
            string? amendmentReason,
            DateTime? dictatedAt,
            DateTime? transcribedAt,
            DateTime? verifiedAt,
            string? dicomStudyUid,
            string? reportPdfUrl,
            string? imagesUrl
        ) : base(id)
        {
            ReportNumber = reportNumber;
            ImagingOrderId = imagingOrderId;
            PatientId = patientId;
            RadiologistId = radiologistId;
            Technique = technique;
            Findings = findings;
            Impression = impression;
            Recommendations = recommendations;
            ComparisonStudies = comparisonStudies;
            Limitations = limitations;
            CriticalFindings = criticalFindings;
            AmendmentReason = amendmentReason;
            DictatedAt = dictatedAt;
            TranscribedAt = transcribedAt;
            VerifiedAt = verifiedAt;
            DicomStudyUid = dicomStudyUid;
            ReportPdfUrl = reportPdfUrl;
            ImagesUrl = imagesUrl;
            StudyDate = DateOnly.FromDateTime(TimeZoneHelper.GetLocalTimeNow());
            StudyTime = TimeOnly.FromDateTime(TimeZoneHelper.GetLocalTimeNow());
            Status = ReportStatus.Draft;
            WorkflowStatus = RadiologyReportStatus.Reporting;
            ImagesCount = 0;
            IsCritical = false;
            IsNormal = false;
            IsFinal = false;
            IsAmended = false;
        }
        #endregion

        #region Setter Methods (27)
        public void SetReportNumber(string reportNumber) { ReportNumber = reportNumber; }
        public void SetImagingOrderId(Guid imagingOrderId) { ImagingOrderId = imagingOrderId; }
        public void SetPatientId(Guid patientId) { PatientId = patientId; }
        public void SetRadiologistId(Guid? radiologistId) { RadiologistId = radiologistId; }
        public void SetTechnique(string? technique) { Technique = technique; }
        public void SetFindings(string? findings) { Findings = findings; }
        public void SetImpression(string? impression) { Impression = impression; }
        public void SetRecommendations(string? recommendations) { Recommendations = recommendations; }
        public void SetComparisonStudies(string? comparisonStudies) { ComparisonStudies = comparisonStudies; }
        public void SetLimitations(string? limitations) { Limitations = limitations; }
        public void SetCriticalFindings(string? criticalFindings) { CriticalFindings = criticalFindings; }
        public void SetIsCritical(bool isCritical) { IsCritical = isCritical; }
        public void SetIsNormal(bool isNormal) { IsNormal = isNormal; }
        public void SetIsFinal(bool isFinal) { IsFinal = isFinal; }
        public void SetIsAmended(bool isAmended) { IsAmended = isAmended; }
        public void SetAmendmentReason(string? amendmentReason) { AmendmentReason = amendmentReason; }
        public void SetDictatedAt(DateTime? dictatedAt) { DictatedAt = dictatedAt; }
        public void SetTranscribedAt(DateTime? transcribedAt) { TranscribedAt = transcribedAt; }
        public void SetVerifiedAt(DateTime? verifiedAt) { VerifiedAt = verifiedAt; }
        public void SetStatus(ReportStatus status) { Status = status; }
        public void SetImagesCount(int imagesCount) { ImagesCount = imagesCount; }
        public void SetDicomStudyUid(string? dicomStudyUid) { DicomStudyUid = dicomStudyUid; }
        public void SetReportPdfUrl(string? reportPdfUrl) { ReportPdfUrl = reportPdfUrl; }
        public void SetImagesUrl(string? imagesUrl) { ImagesUrl = imagesUrl; }
        public void SetStudyDate(DateOnly studyDate) { StudyDate = studyDate; }
        public void SetStudyTime(TimeOnly studyTime) { StudyTime = studyTime; }
        public void SetClinicalIndication(string? clinicalIndication) { ClinicalIndication = clinicalIndication; }
        #endregion

        #region Workflow
        /// <summary>
        /// Saves the draft text. A report with both findings and impression is ready for verification;
        /// saving after a rejection or a return for revision puts it back in that queue.
        /// </summary>
        public void SaveDraft(Guid? radiologistId, bool isCritical, DateTime at)
        {
            if (WorkflowStatus is RadiologyReportStatus.Verified or RadiologyReportStatus.Released) return;

            RadiologistId ??= radiologistId;
            IsCritical = isCritical;
            DictatedAt ??= at;
            LastSavedAt = at;
            WorkflowStatus = string.IsNullOrWhiteSpace(Findings) || string.IsNullOrWhiteSpace(Impression)
                ? RadiologyReportStatus.Reporting
                : RadiologyReportStatus.PendingVerification;
        }

        public void Approve(Guid verifierId, DateTime at)
        {
            WorkflowStatus = RadiologyReportStatus.Verified;
            VerifierId = verifierId;
            VerifiedAt = at;
            ReleasedAt = at;
            IsFinal = true;
            Status = ReportStatus.Final;
            RejectionReason = null;
        }

        public void Reject(string reason)
        {
            WorkflowStatus = RadiologyReportStatus.Rejected;
            RejectionReason = reason;
            VerifierId = null;
            VerifiedAt = null;
            ReleasedAt = null;
            IsFinal = false;
            Status = ReportStatus.Draft;
        }

        public void ReturnForRevision(string reason)
        {
            WorkflowStatus = RadiologyReportStatus.ReturnedForRevision;
            RejectionReason = reason;
            VerifierId = null;
            VerifiedAt = null;
            ReleasedAt = null;
            IsFinal = false;
            Status = ReportStatus.Draft;
        }
        #endregion
    }
}
