using FluentValidation;

namespace PhysioBoo.Application.Commands.Patients.UpdatePatient
{
    public sealed class UpdatePatientCommandValidation : AbstractValidator<UpdatePatientCommand>
    {
        public UpdatePatientCommandValidation()
        {

        }
    }
}