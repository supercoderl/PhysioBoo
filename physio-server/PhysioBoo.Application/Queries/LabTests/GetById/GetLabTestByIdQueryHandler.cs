using MediatR;
using PhysioBoo.Application.ViewModels.LabTests;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Queries.LabTests.GetById
{
    public sealed class GetLabTestByIdQueryHandler : IRequestHandler<GetLabTestByIdQuery, LabTestViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly ILabTestRepository _labTestRepository;

        public GetLabTestByIdQueryHandler(
            IMediatorHandler bus,
            ILabTestRepository labTestRepository
        )
        {
            _bus = bus;
            _labTestRepository = labTestRepository;
        }

        public async Task<LabTestViewModel?> Handle(GetLabTestByIdQuery request, CancellationToken ct)
        {
            LabTest? labTest = await _labTestRepository.GetByIdAsync(request.Id, ct: ct);

            if (labTest == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetLabTestByIdQuery),
                    $"Lab test with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            return LabTestViewModel.FromLabTest(labTest);
        }
    }
}
