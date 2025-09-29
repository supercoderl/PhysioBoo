using MediatR;
using PhysioBoo.Application.ViewModels.ImagingModalities;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.ImagingModalities.CreateImagingModality
{
    public sealed class CreateImagingModalityCommand : CommandBase, IRequest
    {
        private static readonly CreateImagingModalityCommandValidation s_validation = new();

        public CreateImagingModalityViewModel NewImagingModality { get; }

        public CreateImagingModalityCommand(CreateImagingModalityViewModel newImagingModality) : base(Guid.NewGuid())
        {
            NewImagingModality = newImagingModality;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
