using MediatR;
using PhysioBoo.Application.ViewModels.Sys_SequenceTrackers;
using PhysioBoo.Domain.Entities.System;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Queries.Sys_SequenceTrackers.GetById
{
    public sealed class GetSys_SequenceTrackerByIdQueryHandler : IRequestHandler<GetSys_SequenceTrackerByIdQuery, Sys_SequenceTrackerViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly ISys_SequenceTrackerRepository _sys_SequenceTrackerRepository;

        public GetSys_SequenceTrackerByIdQueryHandler(
            IMediatorHandler bus,
            ISys_SequenceTrackerRepository sys_SequenceTrackerRepository
        )
        {
            _bus = bus;
            _sys_SequenceTrackerRepository = sys_SequenceTrackerRepository;
        }

        public async Task<Sys_SequenceTrackerViewModel?> Handle(GetSys_SequenceTrackerByIdQuery request, CancellationToken cancellationToken)
        {
            Sys_SequenceTracker? sys_SequenceTracker = await _sys_SequenceTrackerRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken);

            if (sys_SequenceTracker == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetSys_SequenceTrackerByIdQuery),
                    $"Sequence tracker with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            return Sys_SequenceTrackerViewModel.FromSys_SequenceTracker(sys_SequenceTracker);
        }
    }
}
