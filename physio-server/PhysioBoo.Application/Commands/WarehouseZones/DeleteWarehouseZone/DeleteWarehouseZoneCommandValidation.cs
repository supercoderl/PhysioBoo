

namespace PhysioBoo.Application.Commands.WarehouseZones.DeleteWarehouseZone
{
    public sealed class DeleteWarehouseZoneCommandValidation : AbstractValidator<DeleteWarehouseZoneCommand>
    {
        public DeleteWarehouseZoneCommandValidation()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithMessage("Id may not be empty.");
        }
    }
}
