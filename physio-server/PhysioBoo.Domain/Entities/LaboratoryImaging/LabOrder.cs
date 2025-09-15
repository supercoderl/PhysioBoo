using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.LaboratoryImaging
{
    public class LabOrder : Entity
    {
        #region Core Lab Order Table (24)
        public string OrderNumber { get; private set; }
        public Guid PatientId { get; private set; }
        public Guid DoctorId { get; private set; }
        public Guid AppointmentId { get; private set; }
        public Guid HospitalId { get; private set; }
        public DateOnly OrderDate { get; private set; }
        public TimeOnly OrderTime { get; private set; }
        public string? ClinicalHistory { get; private set; }
        public string? PrivisionalDiagnosis { get; private set; }
        public LabPriority LabPriority { get; private set; }
        public CollectionType CollectionType { get; private set; }
        public DateOnly? CollectionDate { get; private set; }
        public TimeOnly? CollectionTime { get; private set; }
        public string? CollectionAddress { get; private set; }
        public string? SpecialInstructions { get; private set; }
        public decimal TotalAmount { get; private set; }
        public decimal DiscountAmount { get; private set; }
        public decimal FinalAmount { get; private set; }
        public PaymentStatus PaymentStatus { get; private set; }
        public OrderStatus OrderStatus { get; private set; }
        public ReportDeliveryMethod ReportDeliveryMethod { get; private set; }
        public Guid CreatedBy { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }

        [ForeignKey("PatientId")]
        [InverseProperty("LabOrders")]
        public virtual Patient? Patient { get; private set; }

        [ForeignKey("DoctorId")]
        [InverseProperty("LabOrders")]
        public virtual Doctor? Doctor { get; private set; }

        [ForeignKey("AppointmentId")]
        [InverseProperty("LabOrders")]
        public virtual Appointment? Appointment { get; private set; }

        [ForeignKey("HospitalId")]
        [InverseProperty("LabOrders")]
        public virtual Hospital? Hospital { get; private set; }

        [ForeignKey("CreatedBy")]
        [InverseProperty("CreatedLabOrders")]
        public virtual User? Creator { get; private set; }

        [InverseProperty("LabOrder")]
        public virtual ICollection<LabOrderItem> LabOrderItems { get; private set; } = new List<LabOrderItem>();

        [InverseProperty("LabOrder")]
        public virtual ICollection<LabReport> LabReports { get; private set; } = new List<LabReport>();
        #endregion

        #region Constructor (24)
        public LabOrder(
            Guid id,
            string orderNumber,
            Guid patientId,
            Guid doctorId,
            Guid appointmentId,
            Guid hospitalId,
            string? clinicalHistory,
            string? privisionalDiagnosis,
            CollectionType collectionType,
            DateOnly? collectionDate,
            TimeOnly? collectionTime,
            string? collectionAddress,
            string? specialInstructions
        ) : base(id)
        {
            OrderNumber = orderNumber;
            PatientId = patientId;
            DoctorId = doctorId;
            AppointmentId = appointmentId;
            HospitalId = hospitalId;
            OrderDate = DateOnly.FromDateTime(TimeZoneHelper.GetLocalTimeNow());
            OrderTime = TimeOnly.FromDateTime(TimeZoneHelper.GetLocalTimeNow());
            ClinicalHistory = clinicalHistory;
            PrivisionalDiagnosis = privisionalDiagnosis;
            LabPriority = LabPriority.Routine;
            CollectionType = collectionType;
            CollectionDate = collectionDate;
            CollectionTime = collectionTime;
            CollectionAddress = collectionAddress;
            SpecialInstructions = specialInstructions;
            TotalAmount = 0;
            DiscountAmount = 0;
            FinalAmount = 0;
            PaymentStatus = PaymentStatus.Pending;
            OrderStatus = OrderStatus.Ordered;
            ReportDeliveryMethod = ReportDeliveryMethod.Email;
            CreatedBy = doctorId;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
            UpdatedAt = null;
        }
        #endregion

        #region Setter Methods (26)
        public void SetOrderNumber(string orderNumber) { OrderNumber = orderNumber; }
        public void SetPatientId(Guid patientId) { PatientId = patientId; }
        public void SetDoctorId(Guid doctorId) { DoctorId = doctorId; }
        public void SetAppointmentId(Guid appointmentId) { AppointmentId = appointmentId; }
        public void SetHospitalId(Guid hospitalId) { HospitalId = hospitalId; }
        public void SetClinicalHistory(string? clinicalHistory) { ClinicalHistory = clinicalHistory; }
        public void SetPrivisionalDiagnosis(string? privisionalDiagnosis) { PrivisionalDiagnosis = privisionalDiagnosis; }
        public void SetLabPriority(LabPriority labPriority) { LabPriority = labPriority; }
        public void SetCollectionType(CollectionType collectionType) { CollectionType = collectionType; }
        public void SetCollectionDate(DateOnly? collectionDate) { CollectionDate = collectionDate; }
        public void SetCollectionTime(TimeOnly? collectionTime) { CollectionTime = collectionTime; }
        public void SetCollectionAddress(string? collectionAddress) { CollectionAddress = collectionAddress; }
        public void SetSpecialInstructions(string? specialInstructions) { SpecialInstructions = specialInstructions; }
        public void SetTotalAmount(decimal totalAmount) { TotalAmount = totalAmount; UpdateFinalAmount(); }
        public void SetDiscountAmount(decimal discountAmount) { DiscountAmount = discountAmount; UpdateFinalAmount(); }
        public void SetPaymentStatus(PaymentStatus paymentStatus) { PaymentStatus = paymentStatus; }
        public void SetOrderStatus(OrderStatus orderStatus) { OrderStatus = orderStatus; }
        public void SetReportDeliveryMethod(ReportDeliveryMethod reportDeliveryMethod) { ReportDeliveryMethod = reportDeliveryMethod; }
        public void SetCreatedBy(Guid createdBy) { CreatedBy = createdBy; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        public void SetUpdatedAt(DateTime updatedAt) { UpdatedAt = updatedAt; }
        private void UpdateFinalAmount()
        {
            FinalAmount = TotalAmount - DiscountAmount;
            if (FinalAmount < 0) FinalAmount = 0;
        }
        #endregion
    }
}
