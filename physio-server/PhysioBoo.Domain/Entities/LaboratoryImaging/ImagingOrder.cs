using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.MedicalStaff;

using PhysioBoo.Domain.Entities.PatientInformation;


namespace PhysioBoo.Domain.Entities.LaboratoryImaging
{
    public class ImagingOrder : TenantEntity
    {
        #region Core Imaging Order Table (32)
        public string OrderNumber { get; private set; }
        public Guid PatientId { get; private set; }
        public Guid DoctorId { get; private set; }
        public Guid AppointmentId { get; private set; }
        public Guid HospitalId { get; private set; }
        public Guid ModalityId { get; private set; }
        public string? BodyPart { get; private set; }
        public string? ClinicalIndication { get; private set; }
        public string? ClinicalHistory { get; private set; }
        public string? ProvisionalDiagnosis { get; private set; }
        public string? SpecificQuestions { get; private set; }
        public bool ContrastRequired { get; private set; }
        public string? ContrastType { get; private set; }
        public LabPriority LabPriority { get; private set; }
        public DateOnly? ScheduledDate { get; private set; }
        public TimeOnly? ScheduledTime { get; private set; }
        public int EstimatedDuration { get; private set; }
        public bool PreparationGiven { get; private set; }
        public decimal PatientWeight { get; private set; }
        public decimal PatientHeight { get; private set; }
        public string? AllergiesNoted { get; private set; }
        public PregnancyStatus PregnancyStatus { get; private set; }
        public bool ImplantsPresent { get; private set; }
        public string? ImplantDetails { get; private set; }
        public bool Claustrophobia { get; private set; }
        public decimal TotalCost { get; private set; }
        public ImagingOrderStatus Status { get; private set; }
        public Guid? TechnicianId { get; private set; }
        public Guid? RadiologistId { get; private set; }

        // Radiology workspace workflow (scheduling, queue, acquisition)
        public string? RoomName { get; private set; }
        public string? TechnicianName { get; private set; }
        public RadiologyQueueStatus? QueueStatus { get; private set; }
        public DateTime? QueueCalledAt { get; private set; }
        public DateTime? ArrivedAt { get; private set; }
        public DateTime? ImagingStartedAt { get; private set; }
        public DateTime? ImagingCompletedAt { get; private set; }
        public string? CancelReason { get; private set; }

        public virtual Patient? Patient { get; private set; }
        public virtual Doctor? Doctor { get; private set; }
        public virtual Appointment? Appointment { get; private set; }
        public virtual Hospital? Hospital { get; private set; }
        public virtual ImagingModality? Modality { get; private set; }
        public virtual User? Technician { get; private set; }
        public virtual User? Radiologist { get; private set; }
        public virtual User? Creator { get; private set; }
        public virtual User? Updater { get; private set; }
        public virtual HospitalGroup? HospitalGroup { get; private set; }

        public virtual ICollection<ImagingReport> ImagingReports { get; private set; } = new List<ImagingReport>();
        #endregion

        #region Constructor (32)
        public ImagingOrder(
            Guid id,
            string orderNumber,
            Guid patientId,
            Guid doctorId,
            Guid appointmentId,
            Guid hospitalId,
            Guid modalityId,
            string? bodyPart,
            string? clinicalIndication,
            string? clinicalHistory,
            string? provisionalDiagnosis,
            string? specificQuestions,
            string? contrastType,
            DateOnly? scheduledDate,
            TimeOnly? scheduledTime,
            int estimatedDuration,
            decimal patientWeight,
            decimal patientHeight,
            string? allergiesNoted,
            PregnancyStatus pregnancyStatus,
            bool implantsPresent,
            string? implantDetails,
            Guid? technicianId,
            Guid? radiologistId
        ) : base(id)
        {
            OrderNumber = orderNumber;
            PatientId = patientId;
            DoctorId = doctorId;
            AppointmentId = appointmentId;
            HospitalId = hospitalId;
            ModalityId = modalityId;
            BodyPart = bodyPart;
            ClinicalIndication = clinicalIndication;
            ClinicalHistory = clinicalHistory;
            ProvisionalDiagnosis = provisionalDiagnosis;
            SpecificQuestions = specificQuestions;
            ContrastRequired = !string.IsNullOrWhiteSpace(contrastType);
            ContrastType = contrastType;
            LabPriority = LabPriority.Routine;
            ScheduledDate = scheduledDate;
            ScheduledTime = scheduledTime;
            EstimatedDuration = estimatedDuration;
            PreparationGiven = false;
            PatientWeight = patientWeight;
            PatientHeight = patientHeight;
            AllergiesNoted = allergiesNoted;
            PregnancyStatus = pregnancyStatus;
            ImplantsPresent = implantsPresent;
            ImplantDetails = implantDetails;
            Claustrophobia = false;
            TotalCost = 0;
            Status = ImagingOrderStatus.Ordered;
            TechnicianId = technicianId;
            RadiologistId = radiologistId;
        }
        #endregion

        #region Setter Methods (32)
        public void SetOrderNumber(string orderNumber) { OrderNumber = orderNumber; }
        public void SetPatientId(Guid patientId) { PatientId = patientId; }
        public void SetDoctorId(Guid doctorId) { DoctorId = doctorId; }
        public void SetAppointmentId(Guid appointmentId) { AppointmentId = appointmentId; }
        public void SetHospitalId(Guid hospitalId) { HospitalId = hospitalId; }
        public void SetModalityId(Guid modalityId) { ModalityId = modalityId; }
        public void SetBodyPart(string? bodyPart) { BodyPart = bodyPart; }
        public void SetClinicalIndication(string? clinicalIndication) { ClinicalIndication = clinicalIndication; }
        public void SetClinicalHistory(string? clinicalHistory) { ClinicalHistory = clinicalHistory; }
        public void SetProvisionalDiagnosis(string? provisionalDiagnosis) { ProvisionalDiagnosis = provisionalDiagnosis; }
        public void SetSpecificQuestions(string? specificQuestions) { SpecificQuestions = specificQuestions; }
        public void SetContrastRequired(bool contrastRequired) { ContrastRequired = contrastRequired; }
        public void SetContrastType(string? contrastType) { ContrastType = contrastType; }
        public void SetLabPriority(LabPriority labPriority) { LabPriority = labPriority; }
        public void SetScheduledDate(DateOnly? scheduledDate) { ScheduledDate = scheduledDate; }
        public void SetScheduledTime(TimeOnly? scheduledTime) { ScheduledTime = scheduledTime; }
        public void SetEstimatedDuration(int estimatedDuration) { EstimatedDuration = estimatedDuration; }
        public void SetPreparationGiven(bool preparationGiven) { PreparationGiven = preparationGiven; }
        public void SetPatientWeight(decimal patientWeight) { PatientWeight = patientWeight; }
        public void SetPatientHeight(decimal patientHeight) { PatientHeight = patientHeight; }
        public void SetAllergiesNoted(string? allergiesNoted) { AllergiesNoted = allergiesNoted; }
        public void SetPregnancyStatus(PregnancyStatus pregnancyStatus) { PregnancyStatus = pregnancyStatus; }
        public void SetImplantsPresent(bool implantsPresent) { ImplantsPresent = implantsPresent; }
        public void SetImplantDetails(string? implantDetails) { ImplantDetails = implantDetails; }
        public void SetClaustrophobia(bool claustrophobia) { Claustrophobia = claustrophobia; }
        public void SetTotalCost(decimal totalCost) { TotalCost = totalCost; }
        public void SetStatus(ImagingOrderStatus status) { Status = status; }
        public void SetTechnicianId(Guid? technicianId) { TechnicianId = technicianId; }
        public void SetRadiologistId(Guid? radiologistId) { RadiologistId = radiologistId; }
        public void SetTechnicianName(string? technicianName) { TechnicianName = technicianName; }
        #endregion

        #region Workflow
        [NotMapped]
        public bool IsCancelled => Status == ImagingOrderStatus.Cancelled;

        [NotMapped]
        public bool IsImagingDone => Status is ImagingOrderStatus.ImagingCompleted or ImagingOrderStatus.ImageUploaded
            or ImagingOrderStatus.Completed or ImagingOrderStatus.ReportPending;

        /// <summary>Books (or moves) the exam. Unscheduled orders become Scheduled and join that day's queue.</summary>
        public void Schedule(DateOnly date, TimeOnly time, string? roomName)
        {
            ScheduledDate = date;
            ScheduledTime = time;
            if (!string.IsNullOrWhiteSpace(roomName)) RoomName = roomName;
            if (Status == ImagingOrderStatus.Ordered) Status = ImagingOrderStatus.Scheduled;
            QueueStatus ??= RadiologyQueueStatus.Waiting;
        }

        public void Cancel(string reason)
        {
            Status = ImagingOrderStatus.Cancelled;
            QueueStatus = RadiologyQueueStatus.Cancelled;
            CancelReason = reason;
        }

        /// <summary>Moves the order through the modality queue and mirrors the step on the order status.</summary>
        public void AdvanceQueue(RadiologyQueueStatus status, DateTime at)
        {
            QueueStatus = status;
            switch (status)
            {
                case RadiologyQueueStatus.Waiting:
                    break;
                case RadiologyQueueStatus.Called:
                    QueueCalledAt = at;
                    ArrivedAt ??= at;
                    if (Status is ImagingOrderStatus.Ordered or ImagingOrderStatus.Scheduled) Status = ImagingOrderStatus.Arrived;
                    break;
                case RadiologyQueueStatus.InProgress:
                    ArrivedAt ??= at;
                    ImagingStartedAt ??= at;
                    Status = ImagingOrderStatus.InProgress;
                    break;
                case RadiologyQueueStatus.Completed:
                    ImagingStartedAt ??= at;
                    ImagingCompletedAt = at;
                    Status = ImagingOrderStatus.ImagingCompleted;
                    break;
                case RadiologyQueueStatus.Cancelled:
                    Cancel("Cancelled from the modality queue");
                    break;
            }
        }

        public void MarkImagesUploaded()
        {
            if (Status == ImagingOrderStatus.ImagingCompleted) Status = ImagingOrderStatus.ImageUploaded;
        }
        #endregion
    }
}