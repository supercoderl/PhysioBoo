using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Entities.Support;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.Operation
{
    public class Bill : Entity
    {
        #region Core Bill Table (31)
        public string BillNumber { get; private set; }
        public Guid PatientId { get; private set; }
        public Guid AppointmentId { get; private set; }
        public Guid HospitalId { get; private set; }
        public Guid DepartmentId { get; private set; }
        public BillType Type { get; private set; }
        public DateOnly BillDate { get; private set; }
        public TimeOnly BillTime { get; private set; }
        public DateOnly? DueDate { get; private set; }
        public decimal Subtotal { get; private set; }
        public decimal TaxAmount { get; private set; }
        public decimal DiscountAmount { get; private set; }
        public decimal TotalAmount { get; private set; }
        public decimal PaidAmount { get; private set; }
        public decimal OutstandingAmount { get; private set; }
        public PaymentStatus PaymentStatus { get; private set; }
        public string? PaymentTerms { get; private set; }
        public string Currency { get; private set; }
        public decimal ExchangeRate { get; private set; }
        public Guid? InsuranceCompanyId { get; private set; }
        public string? InsuranceClaimNumber { get; private set; }
        public decimal InsuranceApprovedAmount { get; private set; }
        public decimal InsurancePaidAmount { get; private set; }
        public decimal PatientCopayAmount { get; private set; }
        public string? Notes { get; private set; }
        public string? TermsAndConditions { get; private set; }
        public Guid CreatedBy { get; private set; }
        public Guid? ApprovedBy { get; private set; }
        public DateTime? ApprovedAt { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }

        [ForeignKey("PatientId")]
        [InverseProperty("Bills")]
        public virtual Patient? Patient { get; private set; }

        [ForeignKey("AppointmentId")]
        [InverseProperty("Bills")]
        public virtual Appointment? Appointment { get; private set; }

        [ForeignKey("HospitalId")]
        [InverseProperty("Bills")]
        public virtual Hospital? Hospital { get; private set; }

        [ForeignKey("DepartmentId")]
        [InverseProperty("Bills")]
        public virtual Department? Department { get; private set; }

        [ForeignKey("InsuranceCompanyId")]
        [InverseProperty("Bills")]
        public virtual InsuranceCompany? InsuranceCompany { get; private set; }

        [ForeignKey("CreatedBy")]
        [InverseProperty("CreatedBills")]
        public virtual User? Creator { get; private set; }

        [ForeignKey("ApprovedBy")]
        [InverseProperty("ApprovedBills")]
        public virtual User? Approver { get; private set; }

        [InverseProperty("Bill")]
        public virtual ICollection<BillItem> BillItems { get; private set; } = new List<BillItem>();

        [InverseProperty("Bill")]
        public virtual ICollection<Payment> Payments { get; private set; } = new List<Payment>();
        #endregion

        #region Constructor (31)
        public Bill(
            Guid id,
            string billNumber,
            Guid patientId,
            Guid appointmentId,
            Guid hospitalId,
            Guid departmentId,
            BillType type,
            DateOnly? dueDate,
            string? paymentTerms,
            Guid? insuranceCompanyId,
            string? insuranceClaimNumber,
            string? notes,
            string? termsAndConditions,
            Guid createdBy
        ) : base(id)
        {
            BillNumber = billNumber;
            PatientId = patientId;
            AppointmentId = appointmentId;
            HospitalId = hospitalId;
            DepartmentId = departmentId;
            Type = type;
            BillDate = DateOnly.FromDateTime(TimeZoneHelper.GetLocalTimeNow());
            BillTime = TimeOnly.FromDateTime(TimeZoneHelper.GetLocalTimeNow());
            DueDate = dueDate;
            Subtotal = 0;
            TaxAmount = 0;
            DiscountAmount = 0;
            TotalAmount = 0;
            PaidAmount = 0;
            OutstandingAmount = 0;
            PaymentStatus = PaymentStatus.Pending;
            PaymentTerms = paymentTerms;
            Currency = "USD";
            ExchangeRate = 1.0000m;
            InsuranceCompanyId = insuranceCompanyId;
            InsuranceClaimNumber = insuranceClaimNumber;
            InsuranceApprovedAmount = 0;
            InsurancePaidAmount = 0;
            PatientCopayAmount = 0;
            Notes = notes;
            TermsAndConditions = termsAndConditions;
            CreatedBy = createdBy;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
            UpdatedAt = null;
            ApprovedBy = null;
            ApprovedAt = null;
        }
        #endregion

        #region Setter Methods (39)
        public void SetBillNumber(string billNumber) { BillNumber = billNumber; }
        public void SetPatientId(Guid patientId) { PatientId = patientId; }
        public void SetAppointmentId(Guid appointmentId) { AppointmentId = appointmentId; }
        public void SetHospitalId(Guid hospitalId) { HospitalId = hospitalId; }
        public void SetDepartmentId(Guid departmentId) { DepartmentId = departmentId; }
        public void SetType(BillType type) { Type = type; }
        public void SetBillDate(DateOnly billDate) { BillDate = billDate; }
        public void SetBillTime(TimeOnly billTime) { BillTime = billTime; }
        public void SetDueDate(DateOnly? dueDate) { DueDate = dueDate; }
        public void SetPaymentStatus(PaymentStatus paymentStatus) { PaymentStatus = paymentStatus; }
        public void SetPaymentTerms(string? paymentTerms) { PaymentTerms = paymentTerms; }
        public void SetCurrency(string currency) { Currency = currency; }
        public void SetExchangeRate(decimal exchangeRate) { ExchangeRate = exchangeRate; }
        public void SetInsuranceCompanyId(Guid? insuranceCompanyId) { InsuranceCompanyId = insuranceCompanyId; }
        public void SetInsuranceClaimNumber(string? insuranceClaimNumber) { InsuranceClaimNumber = insuranceClaimNumber; }
        public void SetApproved(Guid approvedBy)
        {
            ApprovedBy = approvedBy;
            ApprovedAt = TimeZoneHelper.GetLocalTimeNow();
        }
        public void UpdateAmounts(decimal subtotal, decimal taxAmount, decimal discountAmount, decimal totalAmount, decimal paidAmount, decimal outstandingAmount, decimal insuranceApprovedAmount, decimal insurancePaidAmount, decimal patientCopayAmount)
        {
            Subtotal = subtotal;
            TaxAmount = taxAmount;
            DiscountAmount = discountAmount;
            TotalAmount = totalAmount;
            PaidAmount = paidAmount;
            OutstandingAmount = outstandingAmount;
            InsuranceApprovedAmount = insuranceApprovedAmount;
            InsurancePaidAmount = insurancePaidAmount;
            PatientCopayAmount = patientCopayAmount;
        }
        public void SetNotes(string? notes) { Notes = notes; }
        public void SetTermsAndConditions(string? termsAndConditions) { TermsAndConditions = termsAndConditions; }
        public void SetCreatedBy(Guid createdBy) { CreatedBy = createdBy; }
        public void SetApprovedBy(Guid? approvedBy) { ApprovedBy = approvedBy; }
        public void SetApprovedAt(DateTime? approvedAt) { ApprovedAt = approvedAt; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        public void SetUpdatedAt(DateTime? updatedAt) { UpdatedAt = updatedAt; }
        #endregion
    }
}
