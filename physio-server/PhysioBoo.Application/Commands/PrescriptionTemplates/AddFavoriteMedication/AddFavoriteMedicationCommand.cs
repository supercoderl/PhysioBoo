using PhysioBoo.Application.ViewModels.PrescriptionTemplates;

namespace PhysioBoo.Application.Commands.PrescriptionTemplates.AddFavoriteMedication
{
    /// <summary>
    /// Adds a medicine to the doctor's favorites, or updates its default dosing if it is already there.
    /// </summary>
    public sealed class AddFavoriteMedicationCommand : CommandBase, IRequest
    {
        private static readonly AddFavoriteMedicationCommandValidation s_validation = new();

        public Guid NewId { get; }
        public Guid DoctorId { get; }
        public AddFavoriteMedicationViewModel Favorite { get; }

        /// <summary>
        /// Set by the handler: the id of the created or updated favorite.
        /// </summary>
        public Guid? FavoriteId { get; set; }

        public AddFavoriteMedicationCommand(Guid newId, Guid doctorId, AddFavoriteMedicationViewModel favorite) : base(newId)
        {
            NewId = newId;
            DoctorId = doctorId;
            Favorite = favorite;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
