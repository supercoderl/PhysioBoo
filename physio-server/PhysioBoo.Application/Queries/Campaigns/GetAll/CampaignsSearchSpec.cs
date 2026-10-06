using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Extensions;
using PhysioBoo.Application.ViewModels.Campaigns;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.Queries.Campaigns.GetAll
{
    public sealed class CampaignsSearchSpec : Specification<Campaign>
    {
        public CampaignsSearchSpec(
            GetAllCampaignsQuery q,
            ISortingExpressionProvider<CampaignViewModel, Campaign> sortingExpressionProvider
        )
        {
            if (!string.IsNullOrEmpty(q.Request.Search))
            {
                string pattern = $"%{q.Request.Search.Trim()}%";
                Query.Where(x =>
                    EF.Functions.ILike(x.Name, pattern) ||
                    EF.Functions.ILike(x.Code, pattern)
                );
            }

            CampaignFilter? filter = q.Request.Filter;
            if (filter != null)
            {
                if (filter.Type.HasValue)
                {
                    Query.Where(x => x.Type == filter.Type.Value);
                }
                if (filter.Status.HasValue)
                {
                    Query.Where(x => x.Status == filter.Status.Value);
                }
                if (filter.Start.HasValue)
                {
                    DateTime start = DateOnly.FromDateTime(filter.Start.Value).ToDateTime(TimeOnly.MinValue);
                    Query.Where(x => x.EndDate == null || x.EndDate >= start);
                }

                if (filter.End.HasValue)
                {
                    DateTime end = DateOnly.FromDateTime(filter.End.Value).ToDateTime(TimeOnly.MinValue);
                    Query.Where(x => x.StartDate == null || x.StartDate <= end);
                }
            }

            if (filter?.Status == null)
            {
                Query.Where(x => x.Status != CampaignStatus.Cancelled);
            }

            SortQuery sortQuery = new SortQuery
            {
                Query = q.Request.Sort
            };
            Query.ApplySorting(sortQuery, sortingExpressionProvider);
        }
    }
}
