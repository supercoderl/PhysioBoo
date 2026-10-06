using PhysioBoo.Application.ViewModels.Surgeries;

namespace PhysioBoo.Application.Commands.Surgeries.CreateSurgery
{
    public sealed class CreateSurgeryCommand : CommandBase, IRequest
    {
        private static readonly CreateSurgeryCommandValidation s_validation = new();

        public Guid NewId { get; }
        public CreateSurgeryViewModel NewSurgery { get; }

        // Filled by the handler so the endpoint can return the scheduled case.
        public SurgeryCaseViewModel? Result { get; set; }

        public CreateSurgeryCommand(Guid newId, CreateSurgeryViewModel newSurgery) : base(Guid.NewGuid())
        {
            NewId = newId;
            NewSurgery = newSurgery;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
