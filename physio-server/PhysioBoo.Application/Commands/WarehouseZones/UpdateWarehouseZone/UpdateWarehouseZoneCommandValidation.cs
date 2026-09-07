

namespace PhysioBoo.Application.Commands.WarehouseZones.UpdateWarehouseZone
{
    public sealed class UpdateWarehouseZoneCommandValidation : AbstractValidator<UpdateWarehouseZoneCommand>
    {
        public UpdateWarehouseZoneCommandValidation()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithMessage("Id may not be empty.");

            RuleFor(cmd => cmd.WarehouseZone.Name)
                .NotEmpty()
                .WithMessage("Name may not be empty.");
        }
    }
}
