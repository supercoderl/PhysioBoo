using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Campaigns
{
    public sealed class CampaignViewModel
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public CampaignType Type { get; set; }
        public CampaignStatus Status { get; set; }
        public Guid? AudienceSegmentId { get; set; }
        public string? AudienceSegmentName { get; set; }
        public string? Goal { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal Budget { get; set; }
        public decimal Spent { get; set; }
        public int Reach { get; set; }
        public int Conversions { get; set; }
        public string? Description { get; set; }
        public Guid? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }

        public static CampaignViewModel FromEntity(Campaign entity)
        {
            return new CampaignViewModel
            {
                Id = entity.Id,
                Code = entity.Code,
                Name = entity.Name,
                Type = entity.Type,
                Status = entity.Status,
                AudienceSegmentId = entity.AudienceSegmentId,
                AudienceSegmentName = Queries.AudienceSegments.AudienceSegmentCatalog.FindName(entity.AudienceSegmentId),
                Goal = entity.Goal,
                StartDate = entity.StartDate,
                EndDate = entity.EndDate,
                Budget = entity.Budget,
                Spent = entity.Spent,
                Reach = entity.Reach,
                Conversions = entity.Conversions,
                Description = entity.Description,
                CreatedBy = entity.CreatedBy,
                CreatedDate = entity.CreatedAt
            };
        }
    }
}
