using FluentValidation;

namespace PhysioBoo.Application.Commands.Doctors.CreateDoctor
{
    public sealed class CreateDoctorCommandValidation : AbstractValidator<CreateDoctorCommand>
    {
        public CreateDoctorCommandValidation()
        {

        }
    }
}
