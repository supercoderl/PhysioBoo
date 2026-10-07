using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Extensions;
using PhysioBoo.Application.ViewModels.HomeContent;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Cms;

namespace PhysioBoo.Application.Queries.HomeTestimonials.GetAll
{
    public sealed class HomeTestimonialsSearchSpec : Specification<HomeTestimonial>
    {
        public HomeTestimonialsSearchSpec(
            GetAllHomeTestimonialsQuery q,
            ISortingExpressionProvider<HomeTestimonialViewModel, HomeTestimonial> sortingExpressionProvider
        )
        {
            if (!string.IsNullOrWhiteSpace(q.Request.Search))
            {
                string pattern = $"%{q.Request.Search.Trim()}%";
                Query.Where(x => EF.Functions.ILike(x.PatientName, pattern));
            }

            if (q.Request.Filter?.Active != null)
            {
                bool active = q.Request.Filter.Active.Value;
                Query.Where(x => x.Active == active);
            }

            SortQuery sortQuery = new SortQuery
            {
                Query = q.Request.Sort
            };
            Query.ApplySorting(sortQuery, sortingExpressionProvider);
        }
    }
}
