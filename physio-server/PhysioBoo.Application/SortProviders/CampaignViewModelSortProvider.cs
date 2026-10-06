using PhysioBoo.Application.ViewModels.Campaigns;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Crm;
using System.Linq.Expressions;

namespace PhysioBoo.Application.SortProviders
{
    public sealed class CampaignViewModelSortProvider : ISortingExpressionProvider<CampaignViewModel, Campaign>
    {
        private static readonly Dictionary<string, Expression<Func<Campaign, object>>> s_expressions = new()
        {
            { "code", x => x.Code }, { "name", x => x.Name },
            { "startdate", x => x.StartDate! }, { "budget", x => x.Budget },
            { "createddate", x => x.CreatedAt }, { "updatedat", x => x.UpdatedAt ?? x.CreatedAt }
        };

        public Dictionary<string, Expression<Func<Campaign, object>>> GetSortingExpressions()
        {
            return s_expressions;
        }
    }
}
