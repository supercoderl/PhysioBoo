using PhysioBoo.Domain.Entities.Crm;

namespace PhysioBoo.Application.ViewModels.Members
{
    public sealed class PointTransactionViewModel
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;        // "earned" | "redeemed"
        public int Points { get; set; }                          // always positive
        public int BalanceAfter { get; set; }
        public string Description { get; set; } = string.Empty;
        public Guid? RewardId { get; set; }
        public string? RewardTitle { get; set; }
        public DateTime Date { get; set; }

        public static PointTransactionViewModel FromEntity(PointTransaction entity)
        {
            return new PointTransactionViewModel
            {
                Id = entity.Id,
                Code = entity.Code,
                Type = entity.Type.ToString().ToLowerInvariant(),
                Points = entity.Points,
                BalanceAfter = entity.BalanceAfter,
                Description = entity.Description,
                RewardId = entity.RewardId,
                RewardTitle = entity.Reward?.Title,
                Date = entity.OccurredAt
            };
        }
    }
}
