using PhysioBoo.Application.ViewModels.HomeContent;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Cms;
using System.Linq.Expressions;

namespace PhysioBoo.Application.SortProviders
{
    public sealed class HomeTestimonialViewModelSortProvider : ISortingExpressionProvider<HomeTestimonialViewModel, HomeTestimonial>
    {
        private static readonly Dictionary<string, Expression<Func<HomeTestimonial, object>>> s_expressions = new()
        {
            { "patientname", x => x.PatientName }, { "rating", x => x.Rating }, { "date", x => x.Date ?? x.CreatedAt }, { "createdat", x => x.CreatedAt }
        };

        public Dictionary<string, Expression<Func<HomeTestimonial, object>>> GetSortingExpressions()
        {
            return s_expressions;
        }
    }
}
