using FluentValidation;

namespace PhysioBoo.Application.Commands.Patients.CreatePatient
{
    public sealed class CreatePatientCommandValidation : AbstractValidator<CreatePatientCommand>
    {
        public CreatePatientCommandValidation()
        {

        }
    }
}
