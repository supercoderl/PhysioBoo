namespace PhysioBoo.Application.Commands.PrescriptionTemplates.RemoveFavoriteMedication
{
    public sealed class RemoveFavoriteMedicationCommand : CommandBase, IRequest
    {
        private static readonly RemoveFavoriteMedicationCommandValidation s_validation = new();

        public Guid DoctorId { get; }
        public Guid FavoriteId { get; }

        public RemoveFavoriteMedicationCommand(Guid doctorId, Guid favoriteId) : base(favoriteId)
        {
            DoctorId = doctorId;
            FavoriteId = favoriteId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
