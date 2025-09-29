using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.MedicalRecords.CreateMedicalRecord
{
    public sealed class CreateMedicalRecordCommandValidation : AbstractValidator<CreateMedicalRecordCommand>
    {
        public CreateMedicalRecordCommandValidation()
        {
            RuleForRecordNumber();
            RuleForPatientId();
            RuleForAppointmentId();
            RuleForDoctorId();
            RuleForHospitalId();
            RuleForIcd10Codes();
        }

        public void RuleForRecordNumber()
        {
            RuleFor(cmd => cmd.NewMedicalRecord.RecordNumber)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.MedicalRecord.EmptyRecordNumber)
                .WithMessage("RecordNumber may not be empty.");
        }

        public void RuleForPatientId()
        {
            RuleFor(cmd => cmd.NewMedicalRecord.PatientId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.MedicalRecord.EmptyPatientId)
                .WithMessage("PatientId may not be empty.");
        }

        public void RuleForAppointmentId()
        {
            RuleFor(cmd => cmd.NewMedicalRecord.AppointmentId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.MedicalRecord.EmptyAppointmentId)
                .WithMessage("AppointmentId may not be empty.");
        }

        public void RuleForDoctorId()
        {
            RuleFor(cmd => cmd.NewMedicalRecord.DoctorId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.MedicalRecord.EmptyDoctorId)
                .WithMessage("DoctorId may not be empty.");
        }

        public void RuleForHospitalId()
        {
            RuleFor(cmd => cmd.NewMedicalRecord.HospitalId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.MedicalRecord.EmptyHospitalId)
                .WithMessage("HospitalId may not be empty.");
        }

        public void RuleForIcd10Codes()
        {
            RuleFor(cmd => cmd.NewMedicalRecord.Icd10Codes)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.MedicalRecord.EmptyIcd10Codes)
                .WithMessage("Icd10Codes may not be empty.");
        }
    }
}
