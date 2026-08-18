using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Entities.Support;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Domain.Entities.Operation
{
    public class Appointment : TenantEntity
    {
        #region Core Appointment Table (48)
        public string AppointmentNumber { get; private set; }
        public Guid PatientId { get; private set; }
        public Guid DoctorId { get; private set; }
        public Guid HospitalId { get; private set; }
        public Guid DepartmentId { get; private set; }
        public Guid AppointmentTypeId { get; private set; }
        public DateOnly ScheduledDate { get; private set; }
        public TimeOnly ScheduledTime { get; private set; }
        public TimeOnly? ScheduledEndTime { get; private set; }
        public TimeOnly? ActualStartTime { get; private set; }
        public TimeOnly? ActualEndTime { get; private set; }
        public int DurationMinutes { get; private set; }
        public AppointmentStatus AppointmentStatus { get; private set; }
        public Priority Priority { get; private set; }
        public ConsultationType ConsultationType { get; private set; }
        public string? ChiefComplaint { get; private set; }
        public string? Symptoms { get; private set; }
        public string? ReasonForVisit { get; private set; }
        public string? ReferralReason { get; private set; }
        public Guid? ReferringDoctorId { get; private set; }
        public string? PreAppointmentNotes { get; private set; }
        public string? PostAppointmentNotes { get; private set; }
        public string? Diagnosis { get; private set; }
        public string? TreatmentPlan { get; private set; }
        public string? PrescriptionsGiven { get; private set; }
        public string? InvestigationsOrdered { get; private set; }
        public bool FollowUpRequired { get; private set; }
        public DateOnly? FollowUpDate { get; private set; }
        public string? FollowUpInstructions { get; private set; }
        public decimal ConsultationFee { get; private set; }
        public decimal AdditionalCharges { get; private set; }
        public decimal DiscountAmount { get; private set; }
        public decimal TotalAmount { get; private set; }
        public PaymentStatus PaymentStatus { get; private set; }
        public string? PaymentMethod { get; private set; }
        public decimal InsuranceClaimAmount { get; private set; }
        public string? RoomNumber { get; private set; }
        public int QueueNumber { get; private set; }
        public int EstimatedWaitTime { get; private set; } // in minutes
        public int PatientSatisfactionRating { get; private set; } // 1 to 5 scale
        public string? PatientFeedback { get; private set; }
        public string? CancellationReason { get; private set; }
        public Guid? CancelledBy { get; private set; }
        public DateTime? CancelledAt { get; private set; }
        public Guid? RescheduledFromAppointmentId { get; private set; }
        public DateTime? CheckedInAt { get; private set; }

        public virtual User? Creator { get; private set; }
        public virtual User? Updater { get; private set; }
        public virtual Patient? Patient { get; private set; }
        public virtual Doctor? Doctor { get; private set; }
        public virtual Hospital? Hospital { get; private set; }
        public virtual Department? Department { get; private set; }
        public virtual AppointmentType? AppointmentType { get; private set; }
        public virtual Doctor? ReferringDoctor { get; private set; }
        public virtual User? CancelledByUser { get; private set; }
        public virtual Appointment? RescheduledFromAppointment { get; private set; }
        public virtual HospitalGroup? HospitalGroup { get; private set; }

        public virtual ICollection<Appointment> RescheduledAppointments { get; private set; } = new List<Appointment>();
        public virtual ICollection<Bill> Bills { get; private set; } = new List<Bill>();
        public virtual ICollection<ImagingOrder> ImagingOrders { get; private set; } = new List<ImagingOrder>();
        public virtual ICollection<LabOrder> LabOrders { get; private set; } = new List<LabOrder>();
        public virtual ICollection<MedicalRecord> MedicalRecords { get; private set; } = new List<MedicalRecord>();
        public virtual ICollection<Prescription> Prescriptions { get; private set; } = new List<Prescription>();
        public virtual ICollection<Review> Reviews { get; private set; } = new List<Review>();
        #endregion

        #region Constructor (48)
        public Appointment(
            Guid id,
            string appointmentNumber,
            Guid patientId,
            Guid doctorId,
            Guid hospitalId,
            Guid departmentId,
            Guid appointmentTypeId,
            DateOnly scheduledDate,
            TimeOnly scheduledTime,
            TimeOnly? scheduledEndTime,
            TimeOnly? actualStartTime,
            TimeOnly? actualEndTime,
            int durationMinutes,
            string? chiefComplaint,
            string? symptoms,
            string? reasonForVisit,
            string? referralReason,
            Guid? referringDoctorId,
            string? preAppointmentNotes,
            string? postAppointmentNotes,
            string? diagnosis,
            string? treatmentPlan,
            string? prescriptionsGiven,
            string? investigationsOrdered,
            DateOnly? followUpDate,
            string? followUpInstructions,
            string? paymentMethod,
            string? roomNumber,
            int queueNumber,
            int estimatedWaitTime,
            int patientSatisfactionRating,
            string? patientFeedback,
            string? cancellationReason,
            Guid? cancelledBy,
            DateTime? cancelledAt,
            Guid? rescheduledFromAppointmentId
        ) : base(id)
        {
            AppointmentNumber = appointmentNumber;
            PatientId = patientId;
            DoctorId = doctorId;
            HospitalId = hospitalId;
            DepartmentId = departmentId;
            AppointmentTypeId = appointmentTypeId;
            ScheduledDate = scheduledDate;
            ScheduledTime = scheduledTime;
            ScheduledEndTime = scheduledEndTime;
            ActualStartTime = actualStartTime;
            ActualEndTime = actualEndTime;
            DurationMinutes = durationMinutes;
            AppointmentStatus = AppointmentStatus.Scheduled;
            Priority = Priority.Low;
            ConsultationType = ConsultationType.InPerson;
            ChiefComplaint = chiefComplaint;
            Symptoms = symptoms;
            ReasonForVisit = reasonForVisit;
            ReferralReason = referralReason;
            ReferringDoctorId = referringDoctorId;
            PreAppointmentNotes = preAppointmentNotes;
            PostAppointmentNotes = postAppointmentNotes;
            Diagnosis = diagnosis;
            TreatmentPlan = treatmentPlan;
            PrescriptionsGiven = prescriptionsGiven;
            InvestigationsOrdered = investigationsOrdered;
            FollowUpRequired = followUpDate.HasValue;
            FollowUpDate = followUpDate;
            FollowUpInstructions = followUpInstructions;
            ConsultationFee = 0;
            AdditionalCharges = 0;
            DiscountAmount = 0;
            TotalAmount = 0;
            PaymentStatus = PaymentStatus.Pending;
            PaymentMethod = paymentMethod;
            InsuranceClaimAmount = 0;
            RoomNumber = roomNumber;
            QueueNumber = queueNumber;
            EstimatedWaitTime = estimatedWaitTime;
            PatientSatisfactionRating = patientSatisfactionRating;
            PatientFeedback = patientFeedback;
            CancellationReason = cancellationReason;
            CancelledBy = cancelledBy;
            CancelledAt = cancelledAt;
            RescheduledFromAppointmentId = rescheduledFromAppointmentId;
        }
        #endregion

        #region Setter Methods ()
        public void SetAppointmentNumber(string appointmentNumber) { AppointmentNumber = appointmentNumber; }
        public void SetPatientId(Guid patientId) { PatientId = patientId; }
        public void SetDoctorId(Guid doctorId) { DoctorId = doctorId; }
        public void SetHospitalId(Guid hospitalId) { HospitalId = hospitalId; }
        public void SetDepartmentId(Guid departmentId) { DepartmentId = departmentId; }
        public void SetAppointmentTypeId(Guid appointmentTypeId) { AppointmentTypeId = appointmentTypeId; }
        public void SetScheduledDate(DateOnly scheduledDate) { ScheduledDate = scheduledDate; }
        public void SetScheduledTime(TimeOnly scheduledTime) { ScheduledTime = scheduledTime; }
        public void SetScheduledEndTime(TimeOnly? scheduledEndTime) { ScheduledEndTime = scheduledEndTime; }
        public void SetActualStartTime(TimeOnly? actualStartTime) { ActualStartTime = actualStartTime; }
        public void SetActualEndTime(TimeOnly? actualEndTime) { ActualEndTime = actualEndTime; }
        public void SetDurationMinutes(int durationMinutes) { DurationMinutes = durationMinutes; }
        public void SetAppointmentStatus(AppointmentStatus appointmentStatus)
        {
            if (appointmentStatus == AppointmentStatus.CheckedIn)
                CheckedInAt = TimeZoneHelper.GetLocalTimeNow();
            AppointmentStatus = appointmentStatus;
        }
        public void SetPriority(Priority priority) { Priority = priority; }
        public void SetConsultationType(ConsultationType consultationType) { ConsultationType = consultationType; }
        public void SetChiefComplaint(string? chiefComplaint) { ChiefComplaint = chiefComplaint; }
        public void SetSymptoms(string? symptoms) { Symptoms = symptoms; }
        public void SetReasonForVisit(string? reasonForVisit) { ReasonForVisit = reasonForVisit; }
        public void SetReferralReason(string? referralReason) { ReferralReason = referralReason; }
        public void SetReferringDoctorId(Guid? referringDoctorId) { ReferringDoctorId = referringDoctorId; }
        public void SetPreAppointmentNotes(string? preAppointmentNotes) { PreAppointmentNotes = preAppointmentNotes; }
        public void SetPostAppointmentNotes(string? postAppointmentNotes) { PostAppointmentNotes = postAppointmentNotes; }
        public void SetDiagnosis(string? diagnosis) { Diagnosis = diagnosis; }
        public void SetTreatmentPlan(string? treatmentPlan) { TreatmentPlan = treatmentPlan; }
        public void SetPrescriptionsGiven(string? prescriptionsGiven) { PrescriptionsGiven = prescriptionsGiven; }
        public void SetInvestigationsOrdered(string? investigationsOrdered) { InvestigationsOrdered = investigationsOrdered; }
        public void SetFollowUpRequired(bool followUpRequired) { FollowUpRequired = followUpRequired; }
        public void SetFollowUpDate(DateOnly? followUpDate) { FollowUpDate = followUpDate; }
        public void SetFollowUpInstructions(string? followUpInstructions) { FollowUpInstructions = followUpInstructions; }
        public void SetConsultationFee(decimal consultationFee) { ConsultationFee = consultationFee; }
        public void SetAdditionalCharges(decimal additionalCharges) { AdditionalCharges = additionalCharges; }
        public void SetDiscountAmount(decimal discountAmount) { DiscountAmount = discountAmount; }
        public void SetTotalAmount(decimal totalAmount) { TotalAmount = totalAmount; }
        public void SetPaymentStatus(PaymentStatus paymentStatus) { PaymentStatus = paymentStatus; }
        public void SetPaymentMethod(string? paymentMethod) { PaymentMethod = paymentMethod; }
        public void SetInsuranceClaimAmount(decimal insuranceClaimAmount) { InsuranceClaimAmount = insuranceClaimAmount; }
        public void SetRoomNumber(string? roomNumber) { RoomNumber = roomNumber; }
        public void SetQueueNumber(int queueNumber) { QueueNumber = queueNumber; }
        public void SetEstimatedWaitTime(int estimatedWaitTime) { EstimatedWaitTime = estimatedWaitTime; }
        public void SetPatientSatisfactionRating(int patientSatisfactionRating) { PatientSatisfactionRating = patientSatisfactionRating; }
        public void SetPatientFeedback(string? patientFeedback) { PatientFeedback = patientFeedback; }
        public void SetCancellationReason(string? cancellationReason) { CancellationReason = cancellationReason; }
        public void SetCancelledBy(Guid? cancelledBy) { CancelledBy = cancelledBy; }
        public void SetCancelledAt(DateTime? cancelledAt) { CancelledAt = cancelledAt; }
        public void SetRescheduledFromAppointmentId(Guid? rescheduledFromAppointmentId) { RescheduledFromAppointmentId = rescheduledFromAppointmentId; }
        public void Complete(
            string diagnosis,
            string? treatmentPlan,
            DateOnly? followUpDate,
            string? doctorNotes,
            DateTime completedAt
        )
        {
            Diagnosis = diagnosis;
            TreatmentPlan = treatmentPlan;
            FollowUpDate = followUpDate;
            AppointmentStatus = AppointmentStatus.Completed;
            ActualEndTime = TimeOnly.FromDateTime(completedAt);
        }
    }
    #endregion
}
