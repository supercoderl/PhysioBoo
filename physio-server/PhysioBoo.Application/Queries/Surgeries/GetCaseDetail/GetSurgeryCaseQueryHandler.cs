using PhysioBoo.Application.ViewModels.Surgeries;
using PhysioBoo.Domain.Entities.Theatre;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Surgeries.GetCaseDetail
{
    public sealed class GetSurgeryCaseQueryHandler : IRequestHandler<GetSurgeryCaseQuery, SurgeryCaseViewModel?>
    {
        private readonly ISurgeryCaseRepository _surgeryRepository;
        private readonly IMediatorHandler _bus;

        public GetSurgeryCaseQueryHandler(
            ISurgeryCaseRepository surgeryRepository,
            IMediatorHandler bus
        )
        {
            _surgeryRepository = surgeryRepository;
            _bus = bus;
        }

        public async Task<SurgeryCaseViewModel?> Handle(GetSurgeryCaseQuery request, CancellationToken cancellationToken)
        {
            // GetWithLinksAsync, not GetByIdAsync: the view model needs the whole graph (gotcha 4)
            SurgeryCase? surgery = await _surgeryRepository.GetWithLinksAsync(request.Id, cancellationToken);
            if (surgery == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetSurgeryCaseQuery),
                    $"Surgery with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return null;
            }

            return SurgeryCaseViewModel.FromCase(surgery, TimeZoneHelper.GetLocalTimeNow());
        }
    }
}
