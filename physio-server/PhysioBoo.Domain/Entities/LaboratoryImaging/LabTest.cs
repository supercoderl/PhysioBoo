using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.LaboratoryImaging
{
    public class LabTest : Entity
    {
        #region Core Lab Test Table (27)
        public string TestName { get; private set; }
        public string? TestCode { get; private set; }
        public Guid CategoryId { get; private set; }
        public string? Description { get; private set; }
        public string? SampleType { get; private set; }
        public string? SampleVolume { get; private set; }
        public string? CollectionInstructions { get; private set; }
        public bool PreparationRequired { get; private set; }
        public string? PreparationInstructions { get; private set; }
        public bool FastingRequired { get; private set; }
        public int FastingHours { get; private set; }
        public string? NormalRangeMale { get; private set; }
        public string? NormalRangeFemale { get; private set; }
        public string? NormalPediatric { get; private set; }
        public string? UnitOfMeasurement { get; private set; }
        public string? Methodology { get; private set; }
        public int ReportingTimeHours { get; private set; }
        public decimal Cost { get; private set; }
        public bool IsProfile { get; private set; }
        public bool IsUrgentAvailable { get; private set; }
        public decimal UrgentCost { get; private set; }
        public int UrgentReportingTimeHours { get; private set; }
        public bool IsHomeCollectionAvailable { get; private set; }
        public decimal HomeCollectionCharge { get; private set; }
        public bool RequiresAppoinment { get; private set; }
        public bool IsActive { get; private set; }
        public DateTime CreatedAt { get; private set; }

        [ForeignKey("CategoryId")]
        [InverseProperty("LabTests")]
        public virtual LabTestCategory? Category { get; private set; }

        [InverseProperty("LabTest")]
        public virtual ICollection<LabOrderItem> LabOrderItems { get; private set; } = new List<LabOrderItem>();
        #endregion

        #region Constructor (27)
        public LabTest(
            Guid id,
            string testName,
            string? testCode,
            Guid categoryId,
            string? description,
            string? sampleType,
            string? sampleVolume,
            string? collectionInstructions,
            string? preparationInstructions,
            string? normalRangeMale,
            string? normalRangeFemale,
            string? normalPediatric,
            string? unitOfMeasurement,
            string? methodology
        ) : base(id)
        {
            TestName = testName;
            TestCode = testCode;
            CategoryId = categoryId;
            Description = description;
            SampleType = sampleType;
            SampleVolume = sampleVolume;
            CollectionInstructions = collectionInstructions;
            PreparationRequired = !string.IsNullOrWhiteSpace(preparationInstructions);
            PreparationInstructions = preparationInstructions;
            FastingRequired = false;
            FastingHours = 0;
            NormalRangeMale = normalRangeMale;
            NormalRangeFemale = normalRangeFemale;
            NormalPediatric = normalPediatric;
            UnitOfMeasurement = unitOfMeasurement;
            Methodology = methodology;
            ReportingTimeHours = 24;
            Cost = 0m;
            IsProfile = false;
            IsUrgentAvailable = false;
            UrgentCost = 0m;
            UrgentReportingTimeHours = 4;
            IsHomeCollectionAvailable = false;
            HomeCollectionCharge = 0m;
            RequiresAppoinment = false;
            IsActive = true;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
        }
        #endregion

        #region Setter Methods (27)
        public void SetTestName(string testName) { TestName = testName; }
        public void SetTestCode(string? testCode) { TestCode = testCode; }
        public void SetCategoryId(Guid categoryId) { CategoryId = categoryId; }
        public void SetDescription(string? description) { Description = description; }
        public void SetSampleType(string? sampleType) { SampleType = sampleType; }
        public void SetSampleVolume(string? sampleVolume) { SampleVolume = sampleVolume; }
        public void SetCollectionInstructions(string? collectionInstructions) { CollectionInstructions = collectionInstructions; }
        public void SetPreparationRequired(bool preparationRequired) { PreparationRequired = preparationRequired; }
        public void SetPreparationInstructions(string? preparationInstructions) { PreparationInstructions = preparationInstructions; }
        public void SetFastingRequired(bool fastingRequired) { FastingRequired = fastingRequired; }
        public void SetFastingHours(int fastingHours) { FastingHours = fastingHours; }
        public void SetNormalRangeMale(string? normalRangeMale) { NormalRangeMale = normalRangeMale; }
        public void SetNormalRangeFemale(string? normalRangeFemale) { NormalRangeFemale = normalRangeFemale; }
        public void SetNormalPediatric(string? normalPediatric) { NormalPediatric = normalPediatric; }
        public void SetUnitOfMeasurement(string? unitOfMeasurement) { UnitOfMeasurement = unitOfMeasurement; }
        public void SetMethodology(string? methodology) { Methodology = methodology; }
        public void SetReportingTimeHours(int reportingTimeHours) { ReportingTimeHours = reportingTimeHours; }
        public void SetCost(decimal cost) { Cost = cost; }
        public void SetIsProfile(bool isProfile) { IsProfile = isProfile; }
        public void SetIsUrgentAvailable(bool isUrgentAvailable) { IsUrgentAvailable = isUrgentAvailable; }
        public void SetUrgentCost(decimal urgentCost) { UrgentCost = urgentCost; }
        public void SetUrgentReportingTimeHours(int urgentReportingTimeHours) { UrgentReportingTimeHours = urgentReportingTimeHours; }
        public void SetIsHomeCollectionAvailable(bool isHomeCollectionAvailable) { IsHomeCollectionAvailable = isHomeCollectionAvailable; }
        public void SetHomeCollectionCharge(decimal homeCollectionCharge) { HomeCollectionCharge = homeCollectionCharge; }
        public void SetRequiresAppoinment(bool requiresAppoinment) { RequiresAppoinment = requiresAppoinment; }
        public void SetIsActive(bool isActive) { IsActive = isActive; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        #endregion
    }
}
