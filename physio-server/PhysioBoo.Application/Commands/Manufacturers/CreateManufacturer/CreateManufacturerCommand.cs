using MediatR;
using PhysioBoo.Application.ViewModels.Manufacturers;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Manufacturers.CreateManufacturer
{
    public sealed class CreateManufacturerCommand : CommandBase, IRequest
    {
        private static readonly CreateManufacturerCommandValidation s_validation = new();

        public CreateManufacturerViewModel NewManufacturer { get; }
        public Guid NewId { get; }

        public CreateManufacturerCommand(CreateManufacturerViewModel newManufacturer, Guid newId) : base(Guid.NewGuid())
        {
            NewManufacturer = newManufacturer;
            NewId = newId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
