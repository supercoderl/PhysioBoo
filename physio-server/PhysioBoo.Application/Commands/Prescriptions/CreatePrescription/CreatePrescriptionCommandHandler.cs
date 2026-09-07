
using PhysioBoo.Application.ViewModels.Prescriptions;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.SharedKernel.Results;

namespace PhysioBoo.Application.Commands.Prescriptions.CreatePrescription
{
    public sealed class CreatePrescriptionCommandHandler : CommandHandlerBase, IRequestHandler<CreatePrescriptionCommand>
    {
        private readonly IPrescriptionRepository _prescriptionRepository;
        private readonly IPrescriptionItemRepository _prescriptionItemRepository;
        private readonly IUser _user;

        public CreatePrescriptionCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IPrescriptionRepository prescriptionRepository,
            IPrescriptionItemRepository prescriptionItemRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _prescriptionRepository = prescriptionRepository;
            _prescriptionItemRepository = prescriptionItemRepository;
            _user = user;
        }

        public async Task Handle(CreatePrescriptionCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Prescription newPrescription = new Prescription(
                request.NewPrescription.Id,
                request.NewPrescription.PrescriptionNumber,
                request.NewPrescription.PatientId,
                request.NewPrescription.DoctorId,
                request.NewPrescription.AppoinmentId,
                request.NewPrescription.MedicalRecordId,
                request.NewPrescription.HospitalId,
                request.NewPrescription.Diagnosis,
                request.NewPrescription.Instructions,
                request.NewPrescription.TotalAmount,
                request.NewPrescription.ValidUntil,
                request.NewPrescription.PharmacistNotes
            );

            newPrescription.SetTenantId(_user.GetTenantId());
            newPrescription.SetCreatedBy(_user.GetUserId());

            DbResult<Guid> result = await _prescriptionRepository.InsertAsync<Prescription, Guid>(newPrescription);

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));

                return;
            }

            foreach (CreatePrescriptionItemInput itemInput in request.NewPrescription.Items)
            {
                PrescriptionItem newItem = new PrescriptionItem(
                    Guid.NewGuid(),
                    newPrescription.Id,
                    itemInput.MedicineId,
                    itemInput.MedicineName,
                    itemInput.GenericName,
                    itemInput.Strength,
                    itemInput.DosageForm,
                    itemInput.QuantityPrescribed,
                    itemInput.DosageInstructions,
                    itemInput.Frequency,
                    itemInput.DurationInDays,
                    itemInput.RouteOfAdministration,
                    itemInput.SpecialInstructions,
                    itemInput.PricePerUnit,
                    itemInput.Unit
                );

                newItem.SetTimingMorning(itemInput.TimingMorning);
                newItem.SetTimingNoon(itemInput.TimingNoon);
                newItem.SetTimingAfternoon(itemInput.TimingAfternoon);
                newItem.SetTimingEvening(itemInput.TimingEvening);
                newItem.SetIsPrn(itemInput.IsPrn);
                newItem.SetBeforeAfterMeal(itemInput.BeforeAfterMeal);
                newItem.SetRefillCount(itemInput.RefillCount);
                newItem.SetIsInsuranceCovered(itemInput.IsInsuranceCovered);
                newItem.SetIsCatalogVerified(itemInput.IsCatalogVerified);

                newItem.SetTenantId(_user.GetTenantId());
                newItem.SetCreatedBy(_user.GetUserId());

                DbResult<Guid> itemResult = await _prescriptionItemRepository.InsertAsync<PrescriptionItem, Guid>(newItem);

                if (!itemResult.Success)
                {
                    await NotifyAsync(new DomainNotification(
                        request.MessageType,
                        $"Insert failed for prescription item '{itemInput.MedicineName}'. Error: {itemResult.Error}",
                        ErrorCodes.CommitFailed
                    ));

                    return;
                }
            }
        }
    }
}
