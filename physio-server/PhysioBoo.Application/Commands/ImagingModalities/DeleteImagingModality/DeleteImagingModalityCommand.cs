using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.ImagingModalities.DeleteImagingModality
{
    public sealed class DeleteImagingModalityCommand : CommandBase
    {
        private static readonly DeleteImagingModalityCommandValidation s_validation = new();

        public Guid Id { get; }
        public bool IsHard { get; }

        public DeleteImagingModalityCommand(
            Guid id,
            bool isHard = false
        ) : base(Guid.NewGuid())
        {
            Id = id;
            IsHard = isHard;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
