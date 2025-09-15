using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.LaboratoryImaging
{
    public class LabReport : Entity
    {
        #region Core Lab Report Table (21)
        public string ReportNumber { get; private set; }
        public Guid LabOrderId { get; private set; }
        public Guid PatientId { get; private set; }
        public Guid DoctorId { get; private set; }
        public DateOnly ReportDate { get; private set; }
        public TimeOnly ReportTime { get; private set; }
        public string? OverallImpression { get; private set; }
        public string? ClinicalCorrelation { get; private set; }
        public string? Recommendations { get; private set; }
        public string? CriticalValues { get; private set; }
        public Guid PathologistId { get; private set; }
        public string? PathologistSignature { get; private set; }
        public bool IsFinal { get; private set; }
        public bool IsAmended { get; private set; }
        public string? AmendmentReason { get; private set; }
        public Guid OriginalReportId { get; private set; }
        public string? ReportPdfUrl { get; private set; }
        public bool DeliveredToPatient { get; private set; }
        public DateTime? DeliveredAt { get; private set; }
        public string? DeliveryMethod { get; private set; }
        public DateTime CreatedAt { get; private set; }

        [ForeignKey("LabOrderId")]
        [InverseProperty("LabReports")]
        public virtual LabOrder? LabOrder { get; private set; }

        [ForeignKey("PatientId")]
        [InverseProperty("LabReports")]
        public virtual Patient? Patient { get; private set; }

        [ForeignKey("DoctorId")]
        [InverseProperty("LabReports")]
        public virtual Doctor? Doctor { get; private set; }

        [ForeignKey("PathologistId")]
        [InverseProperty("PathologistLabReports")]
        public virtual User? Pathologist { get; private set; }

        [ForeignKey("OriginalReportId")]
        [InverseProperty("AmendedReports")]
        public virtual LabReport? OriginalReport { get; private set; }

        [InverseProperty("OriginalReport")]
        public virtual ICollection<LabReport> AmendedReports { get; private set; } = new List<LabReport>();
        #endregion

        #region Constructor (21)
        public LabReport(
            Guid id,
            string reportNumber,
            Guid labOrderId,
            Guid patientId,
            Guid doctorId,
            Guid pathologistId,
            string? overallImpression,
            string? clinicalCorrelation,
            string? recommendations,
            string? criticalValues,
            string? pathologistSignature,
            string? amendmentReason,
            Guid originalReportId,
            string? reportPdfUrl,
            DateTime? deliveredAt,
            string? deliveryMethod
        ) : base(id)
        {
            ReportNumber = reportNumber;
            LabOrderId = labOrderId;
            PatientId = patientId;
            DoctorId = doctorId;
            ReportDate = DateOnly.FromDateTime(TimeZoneHelper.GetLocalTimeNow());
            ReportTime = TimeOnly.FromDateTime(TimeZoneHelper.GetLocalTimeNow());
            OverallImpression = overallImpression;
            ClinicalCorrelation = clinicalCorrelation;
            Recommendations = recommendations;
            CriticalValues = criticalValues;
            PathologistId = pathologistId;
            PathologistSignature = pathologistSignature;
            IsFinal = false;
            IsAmended = false;
            AmendmentReason = amendmentReason;
            OriginalReportId = originalReportId;
            ReportPdfUrl = reportPdfUrl;
            DeliveredToPatient = false;
            DeliveredAt = deliveredAt;
            DeliveryMethod = deliveryMethod;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
        }
        #endregion

        #region Setter Methods (26)
        public void SetReportNumber(string reportNumber) { ReportNumber = reportNumber; }
        public void SetLabOrderId(Guid labOrderId) { LabOrderId = labOrderId; }
        public void SetPatientId(Guid patientId) { PatientId = patientId; }
        public void SetDoctorId(Guid doctorId) { DoctorId = doctorId; }
        public void SetReportDate(DateOnly reportDate) { ReportDate = reportDate; }
        public void SetReportTime(TimeOnly reportTime) { ReportTime = reportTime; }
        public void SetOverallImpression(string? overallImpression) { OverallImpression = overallImpression; }
        public void SetClinicalCorrelation(string? clinicalCorrelation) { ClinicalCorrelation = clinicalCorrelation; }
        public void SetRecommendations(string? recommendations) { Recommendations = recommendations; }
        public void SetCriticalValues(string? criticalValues) { CriticalValues = criticalValues; }
        public void SetPathologistId(Guid pathologistId) { PathologistId = pathologistId; }
        public void SetPathologistSignature(string? pathologistSignature) { PathologistSignature = pathologistSignature; }
        public void MarkAsFinal() { IsFinal = true; }
        public void MarkAsAmended(string amendmentReason)
        {
            IsAmended = true;
            AmendmentReason = amendmentReason;
        }
        public void SetOriginalReportId(Guid originalReportId) { OriginalReportId = originalReportId; }
        public void SetReportPdfUrl(string? reportPdfUrl) { ReportPdfUrl = reportPdfUrl; }
        public void MarkAsDelivered(DateTime deliveredAt, string deliveryMethod)
        {
            DeliveredToPatient = true;
            DeliveredAt = deliveredAt;
            DeliveryMethod = deliveryMethod;
        }
        #endregion
    }
}
