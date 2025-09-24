using FluentValidation;

namespace PhysioBoo.Application.Commands.PatientMedicalHistories.CreatePatientMedicalHistory
{
    public sealed class CreatePatientMedicalHistoryCommandValidation : AbstractValidator<CreatePatientMedicalHistoryCommand>
    {
        public CreatePatientMedicalHistoryCommandValidation()
        {

        }
    }
}
