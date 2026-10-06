using PhysioBoo.Domain.Entities.Crm;

namespace PhysioBoo.Application.ViewModels.Rewards
{
    public sealed class RewardViewModel
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int PointsRequired { get; set; }
        public string Category { get; set; } = string.Empty;    // "discount": UI compares lowercase
        public bool Available { get; set; }

        public static RewardViewModel FromEntity(Reward entity)
        {
            return new RewardViewModel
            {
                Id = entity.Id,
                Code = entity.Code,
                Title = entity.Title,
                Description = entity.Description,
                PointsRequired = entity.PointsRequired,
                Category = entity.Category.ToString().ToLowerInvariant(),
                Available = entity.IsAvailable
            };
        }
    }
}
