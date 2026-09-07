

namespace PhysioBoo.Application.Commands.WarehouseZones.CreateWarehouseZone
{
    public sealed class CreateWarehouseZoneCommandValidation : AbstractValidator<CreateWarehouseZoneCommand>
    {
        public CreateWarehouseZoneCommandValidation()
        {
            RuleFor(cmd => cmd.NewWarehouseZone.Name)
                .NotEmpty()
                .WithMessage("Name may not be empty.");

            RuleFor(cmd => cmd.NewWarehouseZone.HospitalId)
                .NotEmpty()
                .WithMessage("HospitalId may not be empty.");
        }
    }
}
