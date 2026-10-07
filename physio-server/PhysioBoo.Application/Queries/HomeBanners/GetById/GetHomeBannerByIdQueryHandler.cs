using PhysioBoo.Application.ViewModels.HomeContent;
using PhysioBoo.Domain.Entities.Cms;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.HomeBanners.GetById
{
    public sealed class GetHomeBannerByIdQueryHandler : IRequestHandler<GetHomeBannerByIdQuery, HomeBannerViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly IHomeBannerRepository _repository;

        public GetHomeBannerByIdQueryHandler(IMediatorHandler bus, IHomeBannerRepository repository)
        {
            _bus = bus;
            _repository = repository;
        }

        public async Task<HomeBannerViewModel?> Handle(GetHomeBannerByIdQuery request, CancellationToken ct)
        {
            HomeBanner? entity = await _repository.GetByIdAsync(request.Id, ct: ct);

            if (entity == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetHomeBannerByIdQuery),
                    $"Home banner with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            return HomeBannerViewModel.FromEntity(entity);
        }
    }
}
