using PhysioBoo.Application.ViewModels.HomeContent;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.HomeTestimonials.GetAll
{
    public sealed record GetAllHomeTestimonialsQuery(
        PagedRequest<HomeTestimonialFilter> Request
    ) : IRequest<PagedResult<HomeTestimonialViewModel>>;
}
