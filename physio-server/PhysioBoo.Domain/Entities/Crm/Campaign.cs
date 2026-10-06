namespace PhysioBoo.Domain.Entities.Crm
{
    public class Campaign : TenantEntity
    {
        #region Core Campaign Table (13)
        public string Code { get; private set; }
        public string Name { get; private set; }
        public CampaignType Type { get; private set; }
        public CampaignStatus Status { get; private set; }
        public Guid? AudienceSegmentId { get; private set; }
        public string? Goal { get; private set; }
        public DateTime? StartDate { get; private set; }
        public DateTime? EndDate { get; private set; }
        public decimal Budget { get; private set; }
        public decimal Spent { get; private set; }
        public int Reach { get; private set; }
        public int Conversions { get; private set; }
        public string? Description { get; private set; }
        #endregion

        #region Constructor (13)
        public Campaign(
            Guid id,
            string code,
            string name,
            CampaignType type,
            Guid? audienceSegmentId,
            string? goal,
            DateTime? startDate,
            DateTime? endDate,
            decimal budget,
            string? description
        ) : base(id)
        {
            Code = code;
            Name = name;
            Type = type;
            Status = CampaignStatus.Draft;
            AudienceSegmentId = audienceSegmentId;
            Goal = goal;
            StartDate = startDate;
            EndDate = endDate;
            Budget = budget;
            Spent = 0;
            Reach = 0;
            Conversions = 0;
            Description = description;
        }
        #endregion

        #region Setter Methods (13)
        public void SetCode(string code) { Code = code; }
        public void SetName(string name) { Name = name; }
        public void SetType(CampaignType type) { Type = type; }
        public void SetStatus(CampaignStatus status) { Status = status; }
        public void SetAudienceSegmentId(Guid? audienceSegmentId) { AudienceSegmentId = audienceSegmentId; }
        public void SetGoal(string? goal) { Goal = goal; }
        public void SetStartDate(DateTime? startDate) { StartDate = startDate; }
        public void SetEndDate(DateTime? endDate) { EndDate = endDate; }
        public void SetBudget(decimal budget) { Budget = budget; }
        public void SetSpent(decimal spent) { Spent = spent; }
        public void SetReach(int reach) { Reach = reach; }
        public void SetConversions(int conversions) { Conversions = conversions; }
        public void SetDescription(string? description) { Description = description; }
        #endregion
    }
}
