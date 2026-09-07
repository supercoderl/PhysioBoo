
using PhysioBoo.Application.ViewModels.Prescriptions;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Queries.Prescriptions.GetById
{
    public sealed class GetPrescriptionByIdQueryHandler : IRequestHandler<GetPrescriptionByIdQuery, PrescriptionDraftViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly IPrescriptionRepository _prescriptionRepository;

        public GetPrescriptionByIdQueryHandler(
            IMediatorHandler bus,
            IPrescriptionRepository prescriptionRepository
        )
        {
            _bus = bus;
            _prescriptionRepository = prescriptionRepository;
        }

        public async Task<PrescriptionDraftViewModel?> Handle(GetPrescriptionByIdQuery request, CancellationToken ct)
        {
            Prescription? prescription = await _prescriptionRepository.GetByIdAsync(
                request.Id, includeProperties: "PrescriptionItems.PrescriptionClinicalWarnings,Patient.Profile,Doctor.User.Profile", ct: ct);

            if (prescription == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(nameof(GetPrescriptionByIdQuery),
                    $"Prescription with id {request.Id} doesn't exist.", ErrorCodes.ObjectNotFound));
                return null;
            }

            return PrescriptionDraftViewModel.FromPrescription(prescription);
        }
    }
}
