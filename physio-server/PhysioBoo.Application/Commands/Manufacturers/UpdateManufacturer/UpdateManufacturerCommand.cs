using PhysioBoo.Application.ViewModels.Manufacturers;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Manufacturers.UpdateManufacturer
{
    public sealed class UpdateManufacturerCommand : CommandBase
    {
        private static readonly UpdateManufacturerCommandValidation s_validation = new();

        public UpdateManufacturerViewModel Manufacturer { get; }
        public Guid Id { get; }

        public UpdateManufacturerCommand(UpdateManufacturerViewModel manufacturer, Guid id) : base(Guid.NewGuid())
        {
            Manufacturer = manufacturer;
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
