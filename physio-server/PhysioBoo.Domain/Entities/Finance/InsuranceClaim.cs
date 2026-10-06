using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Entities.Support;

namespace PhysioBoo.Domain.Entities.Finance
{
    public class InsuranceClaim : TenantEntity
    {
        #region Core Insurance Claim Table (23)
        public string ClaimNumber { get; private set; }
        public Guid InsuranceCompanyId { get; private set; }
        public Guid? PatientId { get; private set; }
        public string PatientName { get; private set; }
        public Guid? BillId { get; private set; }
        public string PolicyNumber { get; private set; }
        public string Diagnosis { get; private set; }
        public string[] Procedures { get; private set; }
        public decimal ClaimAmount { get; private set; }
        public decimal? ApprovedAmount { get; private set; }
        public decimal? SettledAmount { get; private set; }
        public string? Hospital { get; private set; }
        public string? Department { get; private set; }
        public string? DoctorName { get; private set; }
        public InsuranceClaimPriority Priority { get; private set; }
        public InsuranceClaimStatus Status { get; private set; }
        public DateTime? SubmittedAt { get; private set; }
        public DateTime? DecidedAt { get; private set; }
        public DateTime? SettledAt { get; private set; }
        public string? SettlementMethod { get; private set; }
        public string? RejectionReason { get; private set; }
        public string? AppealGrounds { get; private set; }
        public string? HospitalNotes { get; private set; }
        #endregion

        #region Navigation Properties
        public virtual InsuranceCompany? InsuranceCompany { get; private set; }
        public virtual Patient? Patient { get; private set; }
        public virtual Bill? Bill { get; private set; }
        public virtual ICollection<InsuranceClaimDocument> Documents { get; private set; } = new List<InsuranceClaimDocument>();
        public virtual ICollection<InsuranceClaimActivity> Activities { get; private set; } = new List<InsuranceClaimActivity>();
        #endregion

        #region Constructor (14)
        public InsuranceClaim(
            Guid id,
            string claimNumber,
            Guid insuranceCompanyId,
            Guid? patientId,
            string patientName,
            Guid? billId,
            string policyNumber,
            string diagnosis,
            string[] procedures,
            decimal claimAmount,
            string? hospital,
            string? department,
            string? doctorName,
            InsuranceClaimPriority priority
        ) : base(id)
        {
            ClaimNumber = claimNumber;
            InsuranceCompanyId = insuranceCompanyId;
            PatientId = patientId;
            PatientName = patientName;
            BillId = billId;
            PolicyNumber = policyNumber;
            Diagnosis = diagnosis;
            Procedures = procedures;
            ClaimAmount = claimAmount;
            Hospital = hospital;
            Department = department;
            DoctorName = doctorName;
            Priority = priority;
            Status = InsuranceClaimStatus.Draft;
        }
        #endregion

        #region Setter Methods
        public void SetStatus(InsuranceClaimStatus status) { Status = status; }
        public void SetHospitalNotes(string? hospitalNotes) { HospitalNotes = hospitalNotes; }
        #endregion

        #region Workflow Methods
        public int MissingRequiredDocumentsCount() =>
            Documents.Count(d => d.Required && d.Status == InsuranceClaimDocumentStatus.Missing);

        /// <summary>
        /// Moves a pre-submission claim between Draft / WaitingDocuments / ReadyToSubmit
        /// depending on whether every required document has been provided.
        /// </summary>
        public void RefreshDocumentStatus()
        {
            if (Status is not (InsuranceClaimStatus.Draft or InsuranceClaimStatus.WaitingDocuments or InsuranceClaimStatus.ReadyToSubmit))
                return;

            Status = MissingRequiredDocumentsCount() > 0
                ? InsuranceClaimStatus.WaitingDocuments
                : InsuranceClaimStatus.ReadyToSubmit;
        }

        public bool CanSubmit() => Status is InsuranceClaimStatus.Draft
            or InsuranceClaimStatus.WaitingDocuments
            or InsuranceClaimStatus.ReadyToSubmit
            or InsuranceClaimStatus.NeedCorrection;

        public bool CanDecide() => Status is InsuranceClaimStatus.Submitted
            or InsuranceClaimStatus.UnderReview
            or InsuranceClaimStatus.Appealed;

        public bool CanAppeal() => Status == InsuranceClaimStatus.Rejected;

        public bool CanSettle() => Status == InsuranceClaimStatus.Approved;

        public void Submit(DateTime submittedAt)
        {
            Status = InsuranceClaimStatus.Submitted;
            SubmittedAt = submittedAt;
        }

        public void Approve(decimal approvedAmount, DateTime decidedAt)
        {
            Status = InsuranceClaimStatus.Approved;
            ApprovedAmount = approvedAmount;
            DecidedAt = decidedAt;
            RejectionReason = null;
        }

        public void Reject(string reason, DateTime decidedAt)
        {
            Status = InsuranceClaimStatus.Rejected;
            RejectionReason = reason;
            DecidedAt = decidedAt;
        }

        public void Appeal(string groundsForAppeal)
        {
            Status = InsuranceClaimStatus.Appealed;
            AppealGrounds = groundsForAppeal;
        }

        public void Settle(decimal settledAmount, DateTime settledAt, string method)
        {
            Status = InsuranceClaimStatus.Settled;
            SettledAmount = settledAmount;
            SettledAt = settledAt;
            SettlementMethod = method;
        }

        public InsuranceClaimStage GetStage() => Status switch
        {
            InsuranceClaimStatus.Draft => InsuranceClaimStage.Verification,
            InsuranceClaimStatus.WaitingDocuments => InsuranceClaimStage.DocumentCollection,
            InsuranceClaimStatus.ReadyToSubmit => InsuranceClaimStage.Coding,
            InsuranceClaimStatus.Submitted => InsuranceClaimStage.Submission,
            InsuranceClaimStatus.UnderReview or InsuranceClaimStatus.Appealed => InsuranceClaimStage.InsuranceReview,
            InsuranceClaimStatus.NeedCorrection or InsuranceClaimStatus.Rejected => InsuranceClaimStage.HospitalResponse,
            _ => InsuranceClaimStage.Settlement
        };
        #endregion
    }
}
