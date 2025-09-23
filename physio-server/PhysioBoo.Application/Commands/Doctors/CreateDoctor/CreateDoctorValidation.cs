using FluentValidation;

namespace PhysioBoo.Application.Commands.Doctors.CreateDoctor
{
    public sealed class CreateDoctorValidation : AbstractValidator<CreateDoctorCommand>
    {
        public CreateDoctorValidation()
        {

        }
    }
}
