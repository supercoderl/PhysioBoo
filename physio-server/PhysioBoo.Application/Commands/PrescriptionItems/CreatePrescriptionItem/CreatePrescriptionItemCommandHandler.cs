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
        private readonly IUser _user;

        public CreatePrescriptionItemCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IPrescriptionItemRepository prescriptionItemRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _prescriptionItemRepository = prescriptionItemRepository;
            _user = user;
        }

        public async Task Handle(CreatePrescriptionItemCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            PrescriptionItem newPrescriptionItem = new PrescriptionItem(
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
            );

            newPrescriptionItem.SetTenantId(_user.GetTenantId());
            newPrescriptionItem.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _prescriptionItemRepository.InsertAsync<PrescriptionItem, Guid>(newPrescriptionItem);

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
