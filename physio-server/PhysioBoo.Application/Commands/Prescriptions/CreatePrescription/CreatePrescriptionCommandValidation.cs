
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Prescriptions.CreatePrescription
{
    public sealed class CreatePrescriptionCommandValidation : AbstractValidator<CreatePrescriptionCommand>
    {
        public CreatePrescriptionCommandValidation()
        {
            RuleForPrescriptionNumber();
            RuleForPatientId();
            RuleForDoctorId();
            RuleForAppoinmentId();
            RuleForMedicalRecordId();
            RuleForHospitalId();
            RuleForItems();
        }

        public void RuleForPrescriptionNumber() =>
            RuleFor(cmd => cmd.NewPrescription.PrescriptionNumber).NotEmpty()
                .WithErrorCode(DomainErrorCodes.Prescription.EmptyPrescriptionNumber)
                .WithMessage("PrescriptionNumber may not be empty.");

        public void RuleForPatientId() =>
            RuleFor(cmd => cmd.NewPrescription.PatientId).NotEmpty()
                .WithErrorCode(DomainErrorCodes.Prescription.EmptyPatientId)
                .WithMessage("PatientId may not be empty.");

        public void RuleForDoctorId() =>
            RuleFor(cmd => cmd.NewPrescription.DoctorId).NotEmpty()
                .WithErrorCode(DomainErrorCodes.Prescription.EmptyDoctorId)
                .WithMessage("DoctorId may not be empty.");

        public void RuleForAppoinmentId() =>
            RuleFor(cmd => cmd.NewPrescription.AppoinmentId).NotEmpty()
                .WithErrorCode(DomainErrorCodes.Prescription.EmptyAppoinmentId)
                .WithMessage("AppoinmentId may not be empty.");

        public void RuleForMedicalRecordId() =>
            RuleFor(cmd => cmd.NewPrescription.MedicalRecordId).NotEmpty()
                .WithErrorCode(DomainErrorCodes.Prescription.EmptyMedicalRecordId)
                .WithMessage("MedicalRecordId may not be empty.");

        public void RuleForHospitalId() =>
            RuleFor(cmd => cmd.NewPrescription.HospitalId).NotEmpty()
                .WithErrorCode(DomainErrorCodes.Prescription.EmptyHospitalId)
                .WithMessage("HospitalId may not be empty.");

        public void RuleForItems() =>
            RuleForEach(cmd => cmd.NewPrescription.Items).ChildRules(item =>
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
                    .WithMessage("QuantityPrescribed must be greater than 0.");

                item.RuleFor(i => i.DurationInDays).GreaterThan(0)
                    .WithMessage("DurationInDays must be greater than 0.");
            });
    }
}
