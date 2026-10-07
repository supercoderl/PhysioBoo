using PhysioBoo.Application.ViewModels.HomeContent;
using PhysioBoo.Domain.Entities.Cms;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.HomeFeatures.GetById
{
    public sealed class GetHomeFeatureByIdQueryHandler : IRequestHandler<GetHomeFeatureByIdQuery, HomeFeatureViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly IHomeFeatureRepository _repository;

        public GetHomeFeatureByIdQueryHandler(IMediatorHandler bus, IHomeFeatureRepository repository)
        {
            _bus = bus;
            _repository = repository;
        }

        public async Task<HomeFeatureViewModel?> Handle(GetHomeFeatureByIdQuery request, CancellationToken ct)
        {
            HomeFeature? entity = await _repository.GetByIdAsync(request.Id, ct: ct);

            if (entity == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetHomeFeatureByIdQuery),
                    $"Home feature with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            return HomeFeatureViewModel.FromEntity(entity);
        }
    }
}
