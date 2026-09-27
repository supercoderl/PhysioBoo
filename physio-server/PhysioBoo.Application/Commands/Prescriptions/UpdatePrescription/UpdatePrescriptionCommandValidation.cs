using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Prescriptions.UpdatePrescription
{
    public sealed class UpdatePrescriptionCommandValidation : AbstractValidator<UpdatePrescriptionCommand>
    {
        public UpdatePrescriptionCommandValidation()
        {
            RuleForId();
            RuleForItems();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Prescription.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Prescription.EmptyId)
                .WithMessage("Id may not be empty.");
        }

        public void RuleForItems()
        {
            RuleForEach(cmd => cmd.Prescription.Items).ChildRules(item =>
            {
                item.RuleFor(i => i.MedicineId).NotEmpty()
                    .WithErrorCode(DomainErrorCodes.PrescriptionItem.EmptyMedicineId)
                    .WithMessage("MedicineId may not be empty.");
                item.RuleFor(i => i.MedicineName).NotEmpty()
                    .WithErrorCode(DomainErrorCodes.PrescriptionItem.EmptyMedicineName)
                    .WithMessage("MedicineName may not be empty.");
                item.RuleFor(i => i.DosageInstructions).NotEmpty()
                    .WithErrorCode(DomainErrorCodes.PrescriptionItem.EmptyDosageInstructions)
                    .WithMessage("DosageInstructions may not be empty.");
                item.RuleFor(i => i.Frequency).NotEmpty()
                    .WithErrorCode(DomainErrorCodes.PrescriptionItem.EmptyFrequency)
                    .WithMessage("Frequency may not be empty.");
                item.RuleFor(i => i.QuantityPrescribed).GreaterThan(0)
                    .WithErrorCode(DomainErrorCodes.Validation.OutOfRange)
                    .WithMessage("QuantityPrescribed must be greater than 0.");
                item.RuleFor(i => i.DurationInDays).GreaterThan(0)
                    .WithErrorCode(DomainErrorCodes.Validation.OutOfRange)
                    .WithMessage("DurationInDays must be greater than 0.");
                item.RuleFor(i => i.PricePerUnit).NotNegative("PricePerUnit");
                item.RuleFor(i => i.RefillCount).NotNegative("RefillCount");
                item.RuleFor(i => i.BeforeAfterMeal).IsInEnum()
                    .WithErrorCode(DomainErrorCodes.Validation.InvalidEnum)
                    .WithMessage("BeforeAfterMeal is invalid.");
            });
        }
    }
}
