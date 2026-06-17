using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Entities.Support;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Attributes;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Domain.Entities.Operation
{
    [PlaceholderGroup("Bill", "bill", Modules = new[] { "billing" }, Order = 10)]
    public class Bill : TenantEntity
    {
        #region Core Bill Table (31)
        [Placeholder(Label = "Bill Number", Example = "BILL-2026-000145")]
        public string BillNumber { get; private set; }

        [Placeholder(Label = "Patient ID", Example = "7c91d3e2-5b4a-4f11-9f2b-9c1e7d5a8812")]
        public Guid PatientId { get; private set; }

        [Placeholder(Label = "Appointment ID", Example = "f1a9b0d2-3c44-42f8-91de-77d9d5b2a123")]
        public Guid AppointmentId { get; private set; }

        [Placeholder(Label = "Hospital ID", Example = "6b2c7f91-2d1f-4a2e-a1b9-3d2f9b7e5c21")]
        public Guid HospitalId { get; private set; }

        [Placeholder(Label = "Department ID", Example = "2f8d3a91-0e4c-48b2-a8c3-7e9d0a5b4f61")]
        public Guid DepartmentId { get; private set; }

        [Placeholder(Label = "Bill Type", Example = "Consultation")]
        public BillType Type { get; private set; }

        [Placeholder(Label = "Bill Date", Example = "2026-05-24")]
        public DateOnly BillDate { get; private set; }

        [Placeholder(Label = "Bill Time", Example = "14:30")]
        public TimeOnly BillTime { get; private set; }

        [Placeholder(Label = "Due Date", Example = "2026-06-05")]
        public DateOnly? DueDate { get; private set; }

        [Placeholder(Label = "Subtotal", Example = "2500000")]
        public decimal Subtotal { get; private set; }

        [Placeholder(Label = "Tax Amount", Example = "250000")]
        public decimal TaxAmount { get; private set; }

        [Placeholder(Label = "Discount Amount", Example = "150000")]
        public decimal DiscountAmount { get; private set; }

        [Placeholder(Label = "Total Amount", Example = "2600000")]
        public decimal TotalAmount { get; private set; }

        [Placeholder(Label = "Paid Amount", Example = "2000000")]
        public decimal PaidAmount { get; private set; }

        [Placeholder(Label = "Outstanding Amount", Example = "600000")]
        public decimal OutstandingAmount { get; private set; }

        [Placeholder(Label = "Payment Status", Example = "PartiallyPaid")]
        public PaymentStatus PaymentStatus { get; private set; }

        [Placeholder(Label = "Payment Terms", Example = "Payment due within 14 days")]
        public string? PaymentTerms { get; private set; }

        [Placeholder(Label = "Currency", Example = "VND")]
        public string Currency { get; private set; }

        [Placeholder(Label = "Exchange Rate", Example = "1.00")]
        public decimal ExchangeRate { get; private set; }

        [Placeholder(Label = "Insurance Company ID", Example = "1a2b3c4d-5e6f-47a8-9b1c-2d3e4f5a6b7c")]
        public Guid? InsuranceCompanyId { get; private set; }

        [Placeholder(Label = "Insurance Claim Number", Example = "ICL-2026-88991")]
        public string? InsuranceClaimNumber { get; private set; }

        [Placeholder(Label = "Insurance Approved Amount", Example = "1800000")]
        public decimal InsuranceApprovedAmount { get; private set; }

        [Placeholder(Label = "Insurance Paid Amount", Example = "1500000")]
        public decimal InsurancePaidAmount { get; private set; }

        [Placeholder(Label = "Patient Copay Amount", Example = "1100000")]
        public decimal PatientCopayAmount { get; private set; }

        [Placeholder(Label = "Notes", Example = "Patient eligible for senior citizen discount.")]
        public string? Notes { get; private set; }

        [Placeholder(
            Label = "Terms And Conditions",
            Example = "All payments must be completed before discharge unless otherwise approved."
        )]
        public string? TermsAndConditions { get; private set; }

        [Placeholder(Label = "Approved By", Example = "9f8e7d6c-5b4a-4321-8d7e-6c5b4a3f2d1e")]
        public Guid? ApprovedBy { get; private set; }

        [Placeholder(Label = "Approved At", Example = "2026-05-24 15:45:00")]
        public DateTime? ApprovedAt { get; private set; }

        public virtual Patient? Patient { get; private set; }
        public virtual Appointment? Appointment { get; private set; }
        public virtual Hospital? Hospital { get; private set; }
        public virtual Department? Department { get; private set; }
        public virtual InsuranceCompany? InsuranceCompany { get; private set; }
        public virtual User? Creator { get; private set; }
        public virtual User? Updater { get; private set; }
        public virtual User? Approver { get; private set; }
        public virtual HospitalGroup? HospitalGroup { get; private set; }

        public virtual ICollection<BillItem> BillItems { get; private set; } = new List<BillItem>();
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
            string? termsAndConditions
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
        public void SetApprovedBy(Guid? approvedBy) { ApprovedBy = approvedBy; }
        public void SetApprovedAt(DateTime? approvedAt) { ApprovedAt = approvedAt; }
        #endregion
    }
}
