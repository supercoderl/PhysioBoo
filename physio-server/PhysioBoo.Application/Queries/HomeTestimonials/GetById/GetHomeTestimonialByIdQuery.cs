using PhysioBoo.Application.ViewModels.HomeContent;

namespace PhysioBoo.Application.Queries.HomeTestimonials.GetById
{
    public sealed record GetHomeTestimonialByIdQuery(Guid Id) : IRequest<HomeTestimonialViewModel?>;
}
