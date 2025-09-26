using MediatR;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.PrescriptionItems.CreatePrescriptionItem
{
    public sealed class CreatePrescriptionItemCommandHandler : CommandHandlerBase, IRequestHandler<CreatePrescriptionItemCommand>
    {
        private readonly IPrescriptionItemRepository _prescriptionItemRepository;

        public CreatePrescriptionItemCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IPrescriptionItemRepository prescriptionItemRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _prescriptionItemRepository = prescriptionItemRepository;
        }

        public async Task Handle(CreatePrescriptionItemCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var result = await _prescriptionItemRepository.InsertAsync<PrescriptionItem, Guid>(new PrescriptionItem(
                request.NewPrescriptionItem.Id,
                request.NewPrescriptionItem.PrescriptionId,
                request.NewPrescriptionItem.MedicineId,
                request.NewPrescriptionItem.MedicineName,
                request.NewPrescriptionItem.GenericName,
                request.NewPrescriptionItem.Strength,
                request.NewPrescriptionItem.DosageForm,
                request.NewPrescriptionItem.QuantityPrescribed,
                request.NewPrescriptionItem.DosageInstructions,
                request.NewPrescriptionItem.Frequency,
                request.NewPrescriptionItem.DurationInDays,
                request.NewPrescriptionItem.RouteOfAdministration,
                request.NewPrescriptionItem.SpecialInstructions,
                request.NewPrescriptionItem.PricePerUnit
            ));

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));

                return;
            }
        }
    }
}
