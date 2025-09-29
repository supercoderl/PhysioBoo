using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.PrescriptionItems.CreatePrescriptionItem
{
    public sealed class CreatePrescriptionItemCommandValidation : AbstractValidator<CreatePrescriptionItemCommand>
    {
        public CreatePrescriptionItemCommandValidation()
        {
            RuleForPrescriptionId();
            RuleForMedicineId();
            RuleForMedicineName();
            RuleForDosageInstructions();
            RuleForFrequency();
        }

        public void RuleForPrescriptionId() =>
            RuleFor(cmd => cmd.NewPrescriptionItem.PrescriptionId).NotEmpty()
                .WithErrorCode(DomainErrorCodes.PrescriptionItem.EmptyPrescriptionId)
                .WithMessage("PrescriptionId may not be empty.");

        public void RuleForMedicineId() =>
            RuleFor(cmd => cmd.NewPrescriptionItem.MedicineId).NotEmpty()
                .WithErrorCode(DomainErrorCodes.PrescriptionItem.EmptyMedicineId)
                .WithMessage("MedicineId may not be empty.");

        public void RuleForMedicineName() =>
            RuleFor(cmd => cmd.NewPrescriptionItem.MedicineName).NotEmpty()
                .WithErrorCode(DomainErrorCodes.PrescriptionItem.EmptyMedicineName)
                .WithMessage("MedicineName may not be empty.");

        public void RuleForDosageInstructions() =>
            RuleFor(cmd => cmd.NewPrescriptionItem.DosageInstructions).NotEmpty()
                .WithErrorCode(DomainErrorCodes.PrescriptionItem.EmptyDosageInstructions)
                .WithMessage("DosageInstructions may not be empty.");

        public void RuleForFrequency() =>
            RuleFor(cmd => cmd.NewPrescriptionItem.Frequency).NotEmpty()
                .WithErrorCode(DomainErrorCodes.PrescriptionItem.EmptyFrequency)
                .WithMessage("Frequency may not be empty.");
    }
}
