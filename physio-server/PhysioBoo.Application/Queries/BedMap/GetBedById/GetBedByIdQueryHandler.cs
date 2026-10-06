using PhysioBoo.Application.ViewModels.BedMap;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.BedMap.GetBedById
{
    public sealed class GetBedByIdQueryHandler : IRequestHandler<GetBedByIdQuery, BedViewModel?>
    {
        private readonly IBedRepository _bedRepository;
        private readonly IMediatorHandler _bus;

        public GetBedByIdQueryHandler(
            IBedRepository bedRepository,
            IMediatorHandler bus
        )
        {
            _bedRepository = bedRepository;
            _bus = bus;
        }

        public async Task<BedViewModel?> Handle(GetBedByIdQuery request, CancellationToken cancellationToken)
        {
            // GetWithLinksAsync, not GetByIdAsync: the view model needs the ward and the current patient (gotcha 4)
            Bed? bed = await _bedRepository.GetWithLinksAsync(request.Id, cancellationToken);
            if (bed == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetBedByIdQuery),
                    $"Bed with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return null;
            }

            return BedViewModel.FromEntity(bed);
        }
    }
}
