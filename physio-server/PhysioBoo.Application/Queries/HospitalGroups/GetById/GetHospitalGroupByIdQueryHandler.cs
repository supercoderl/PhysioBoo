using MediatR;
using PhysioBoo.Application.ViewModels.HospitalGroups;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Queries.HospitalGroups.GetById
{
    public sealed class GetHospitalGroupByIdQueryHandler : IRequestHandler<GetHospitalGroupByIdQuery, HospitalGroupViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly IHospitalGroupRepository _hospitalGroupRepository;

        public GetHospitalGroupByIdQueryHandler(
            IMediatorHandler bus,
            IHospitalGroupRepository hospitalGroupRepository
        )
        {
            _bus = bus;
            _hospitalGroupRepository = hospitalGroupRepository;
        }

        public async Task<HospitalGroupViewModel?> Handle(GetHospitalGroupByIdQuery request, CancellationToken cancellationToken)
        {
            HospitalGroup? hospitalGroup = await _hospitalGroupRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken);

            if (hospitalGroup == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetHospitalGroupByIdQuery),
                    $"Hospital group with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            return HospitalGroupViewModel.FromHospitalGroup(hospitalGroup);
        }
    }
}
