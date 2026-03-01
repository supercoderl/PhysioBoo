using PhysioBoo.Application.ViewModels.ImagingModalities;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.ImagingModalities.UpdateImagingModality
{
    public sealed class UpdateImagingModalityCommand : CommandBase
    {
        private static readonly UpdateImagingModalityCommandValidation s_validation = new();

        public UpdateImagingModalityViewModel ImagingModality { get; }

        public UpdateImagingModalityCommand(UpdateImagingModalityViewModel imagingModality) : base(Guid.NewGuid())
        {
            ImagingModality = imagingModality;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
