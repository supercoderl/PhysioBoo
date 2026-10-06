namespace PhysioBoo.Domain.Entities.Finance
{
    public class InsuranceClaimDocument : TenantEntity
    {
        #region Core Insurance Claim Document Table (10)
        public Guid ClaimId { get; private set; }
        public string Name { get; private set; }
        public string Type { get; private set; }
        public InsuranceClaimDocumentStatus Status { get; private set; }
        public bool Required { get; private set; }
        public string? Url { get; private set; }
        public string? PublicId { get; private set; }
        public int? SizeKb { get; private set; }
        public DateTime? UploadedAt { get; private set; }
        public string? UploadedBy { get; private set; }
        #endregion

        #region Navigation Properties
        public virtual InsuranceClaim? Claim { get; private set; }
        #endregion

        #region Constructor (5)
        public InsuranceClaimDocument(
            Guid id,
            Guid claimId,
            string name,
            string type,
            bool required
        ) : base(id)
        {
            ClaimId = claimId;
            Name = name;
            Type = type;
            Required = required;
            Status = InsuranceClaimDocumentStatus.Missing;
        }
        #endregion

        #region Methods
        public void MarkUploaded(string fileName, string url, string? publicId, int sizeKb, string uploadedBy, DateTime uploadedAt)
        {
            if (!Required) Name = fileName;
            Url = url;
            PublicId = publicId;
            SizeKb = sizeKb;
            UploadedBy = uploadedBy;
            UploadedAt = uploadedAt;
            Status = InsuranceClaimDocumentStatus.Uploaded;
        }
        #endregion
    }
}
