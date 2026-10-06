namespace PhysioBoo.Domain.Entities.Crm
{
    public class Reward : TenantEntity
    {
        #region Core Reward Table (6)
        public string Code { get; private set; }
        public string Title { get; private set; }
        public string? Description { get; private set; }
        public int PointsRequired { get; private set; }
        public RewardCategory Category { get; private set; }
        public bool IsAvailable { get; private set; }
        #endregion

        #region Constructor (6)
        public Reward(
            Guid id,
            string code,
            string title,
            string? description,
            int pointsRequired,
            RewardCategory category
        ) : base(id)
        {
            Code = code;
            Title = title;
            Description = description;
            PointsRequired = pointsRequired;
            Category = category;
            IsAvailable = true;
        }
        #endregion

        #region Setter Methods (6)
        public void SetCode(string code) { Code = code; }
        public void SetTitle(string title) { Title = title; }
        public void SetDescription(string? description) { Description = description; }
        public void SetPointsRequired(int pointsRequired) { PointsRequired = pointsRequired; }
        public void SetCategory(RewardCategory category) { Category = category; }
        public void SetIsAvailable(bool isAvailable) { IsAvailable = isAvailable; }
        #endregion
    }
}
