
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Prescriptions.UpdatePrescription
{
    public sealed class UpdatePrescriptionCommandHandler : CommandHandlerBase, IRequestHandler<UpdatePrescriptionCommand>
    {
        private readonly IPrescriptionRepository _prescriptionRepository;
        private readonly IPrescriptionItemRepository _prescriptionItemRepository;

        public UpdatePrescriptionCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IPrescriptionRepository prescriptionRepository,
            IPrescriptionItemRepository prescriptionItemRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _prescriptionRepository = prescriptionRepository;
            _prescriptionItemRepository = prescriptionItemRepository;
        }

        public async Task Handle(UpdatePrescriptionCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Prescription? prescription = await _prescriptionRepository.GetByIdAsync(
            request.Prescription.Id, includeProperties: "PrescriptionItems", ct: ct);

            if (prescription == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType,
                    $"Prescription with Id {request.Prescription.Id} not found.", ErrorCodes.ObjectNotFound));
                return;
            }

            if (prescription.Status != PrescriptionStatus.Draft)
            {
                await NotifyAsync(new DomainNotification(request.MessageType,
                    "Only a Draft prescription can be updated.", ErrorCodes.ValidationFailed));
                return;
            }

            prescription.SetDiagnosis(request.Prescription.Diagnosis);
            prescription.SetInstructions(request.Prescription.Instructions);

            HashSet<Guid> incomingIds = request.Prescription.Items.Where(i => i.Id.HasValue).Select(i => i.Id!.Value).ToHashSet();
            foreach (PrescriptionItem existing in prescription.PrescriptionItems.Where(i => !incomingIds.Contains(i.Id)).ToList())
            {
                prescription.PrescriptionItems.Remove(existing);
            }
            foreach (ViewModels.Prescriptions.UpdatePrescriptionItemInput input in request.Prescription.Items)
            {
                if (input.Id is { } id && prescription.PrescriptionItems.FirstOrDefault(i => i.Id == id) is { } existing)
                {
                    existing.SetMedicineId(input.MedicineId);
                    existing.SetMedicineName(input.MedicineName);
                    existing.SetGenericName(input.GenericName);
                    existing.SetStrength(input.Strength);
                    existing.SetDosageForm(input.DosageForm);
                    existing.SetQuantityPrescribed(input.QuantityPrescribed);
                    existing.SetDosageInstructions(input.DosageInstructions);
                    existing.SetFrequency(input.Frequency);
                    existing.SetDurationInDays(input.DurationInDays);
                    existing.SetRouteOfAdministration(input.RouteOfAdministration);
                    existing.SetSpecialInstructions(input.SpecialInstructions);
                    existing.SetPricePerUnit(input.PricePerUnit);
                    existing.SetTimingMorning(input.TimingMorning);
                    existing.SetTimingNoon(input.TimingNoon);
                    existing.SetTimingAfternoon(input.TimingAfternoon);
                    existing.SetTimingEvening(input.TimingEvening);
                    existing.SetIsPrn(input.IsPrn);
                    existing.SetBeforeAfterMeal(input.BeforeAfterMeal);
                    existing.SetUnit(input.Unit);
                    existing.SetRefillCount(input.RefillCount);
                    existing.SetIsInsuranceCovered(input.IsInsuranceCovered);
                    existing.SetIsCatalogVerified(input.IsCatalogVerified);
                }
                else
                {
                    PrescriptionItem newItem = new PrescriptionItem(
                        Guid.NewGuid(),
                        prescription.Id,
                        input.MedicineId,
                        input.MedicineName,
                        input.GenericName,
                        input.Strength,
                        input.DosageForm,
                        input.QuantityPrescribed,
                        input.DosageInstructions,
                        input.Frequency,
                        input.DurationInDays,
                        input.RouteOfAdministration,
                        input.SpecialInstructions,
                        input.PricePerUnit,
                        input.Unit
                    );

                    newItem.SetTenantId(prescription.TenantId);
                    newItem.SetTimingMorning(input.TimingMorning);
                    newItem.SetTimingNoon(input.TimingNoon);
                    newItem.SetTimingAfternoon(input.TimingAfternoon);
                    newItem.SetTimingEvening(input.TimingEvening);
                    newItem.SetIsPrn(input.IsPrn);
                    newItem.SetBeforeAfterMeal(input.BeforeAfterMeal);
                    newItem.SetRefillCount(input.RefillCount);
                    newItem.SetIsInsuranceCovered(input.IsInsuranceCovered);
                    newItem.SetIsCatalogVerified(input.IsCatalogVerified);
                    prescription.PrescriptionItems.Add(newItem);
                }
            }

            await _prescriptionRepository.UpdateTrackedAsync(prescription, ct);
        }
    }
}