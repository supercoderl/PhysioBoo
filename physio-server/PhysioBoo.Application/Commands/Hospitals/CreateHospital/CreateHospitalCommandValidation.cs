using FluentValidation;

namespace PhysioBoo.Application.Commands.Hospitals.CreateHospital
{
    public sealed class CreateHospitalCommandValidation : AbstractValidator<CreateHospitalCommand>
    {
        public CreateHospitalCommandValidation()
        {

        }
    }
}
