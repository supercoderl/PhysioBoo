using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.LaboratoryImaging
{
    public class ImagingModality : Entity
    {
        #region Core Imaging Modality Table (11)
        public string Name { get; private set; }
        public string? Code { get; private set; }
        public string? Description { get; private set; }
        public string? Category { get; private set; }
        public bool RequiresContrast { get; private set; }
        public bool PreparationRequired { get; private set; }
        public string? PreparationInstructions { get; private set; }
        public int AverageDurationMinutes { get; private set; }
        public decimal RadiationDose { get; private set; }
        public bool IsActive { get; private set; }
        public DateTime CreatedAt { get; private set; }

        [InverseProperty("Modality")]
        public virtual ICollection<ImagingOrder> ImagingOrders { get; private set; } = new List<ImagingOrder>();
        #endregion

        #region Constructor(11)
        public ImagingModality(
            Guid id,
            string name,
            string? code,
            string? description,
            string? category,
            string? preparationInstructions,
            decimal radiationDose
        ) : base(id)
        {
            Name = name;
            Code = code;
            Description = description;
            Category = category;
            RequiresContrast = false;
            PreparationRequired = !string.IsNullOrWhiteSpace(preparationInstructions);
            PreparationInstructions = preparationInstructions;
            AverageDurationMinutes = 30;
            RadiationDose = radiationDose;
            IsActive = true;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
        }
        #endregion

        #region Setter Methods (11)
        public void SetName(string name) { Name = name; }
        public void SetCode(string? code) { Code = code; }
        public void SetDescription(string? description) { Description = description; }
        public void SetCategory(string? category) { Category = category; }
        public void SetRequiresContrast(bool requiresContrast) { RequiresContrast = requiresContrast; }
        public void SetPreparationRequired(bool preparationRequired) { PreparationRequired = preparationRequired; }
        public void SetPreparationInstructions(string? preparationInstructions) { PreparationInstructions = preparationInstructions; }
        public void SetAverageDurationMinutes(int averageDurationMinutes) { AverageDurationMinutes = averageDurationMinutes; }
        public void SetRadiationDose(decimal radiationDose) { RadiationDose = radiationDose; }
        public void SetIsActive(bool isActive) { IsActive = isActive; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        #endregion
    }
}
