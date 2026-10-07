using PhysioBoo.Application.ViewModels.HomeContent;
using PhysioBoo.Domain.Entities.Cms;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.HomeTestimonials.GetById
{
    public sealed class GetHomeTestimonialByIdQueryHandler : IRequestHandler<GetHomeTestimonialByIdQuery, HomeTestimonialViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly IHomeTestimonialRepository _repository;

        public GetHomeTestimonialByIdQueryHandler(IMediatorHandler bus, IHomeTestimonialRepository repository)
        {
            _bus = bus;
            _repository = repository;
        }

        public async Task<HomeTestimonialViewModel?> Handle(GetHomeTestimonialByIdQuery request, CancellationToken ct)
        {
            HomeTestimonial? entity = await _repository.GetByIdAsync(request.Id, ct: ct);

            if (entity == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetHomeTestimonialByIdQuery),
                    $"Home testimonial with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            return HomeTestimonialViewModel.FromEntity(entity);
        }
    }
}
