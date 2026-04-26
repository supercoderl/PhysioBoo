using PhysioBoo.Application.ViewModels.ImagingModalities;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.ImagingModalities.UpdateImagingModality
{
    public sealed class UpdateImagingModalityCommand : CommandBase
    {
        private static readonly UpdateImagingModalityCommandValidation s_validation = new();

        public UpdateImagingModalityViewModel ImagingModality { get; }
        public Guid Id { get; }

        public UpdateImagingModalityCommand(UpdateImagingModalityViewModel imagingModality, Guid id) : base(Guid.NewGuid())
        {
            ImagingModality = imagingModality;
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
