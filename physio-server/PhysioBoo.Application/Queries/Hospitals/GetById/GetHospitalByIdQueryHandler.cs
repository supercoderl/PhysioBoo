using MediatR;
using PhysioBoo.Application.ViewModels.Hospitals;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Queries.Hospitals.GetById
{
    public sealed class GetHospitalByIdQueryHandler : IRequestHandler<GetHospitalByIdQuery, HospitalViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly IHospitalRepository _hospitalRepository;

        public GetHospitalByIdQueryHandler(
            IMediatorHandler bus,
            IHospitalRepository hospitalRepository
        )
        {
            _bus = bus;
            _hospitalRepository = hospitalRepository;
        }

        public async Task<HospitalViewModel?> Handle(GetHospitalByIdQuery request, CancellationToken cancellationToken)
        {
            Hospital? hospital = await _hospitalRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken);

            if (hospital == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetHospitalByIdQuery),
                    $"Hospital with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            return HospitalViewModel.FromHospital(hospital);
        }
    }
}
