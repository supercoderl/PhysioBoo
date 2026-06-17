using NpgsqlTypes;
using PhysioBoo.SharedKernel.Attributes;
using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.LaboratoryImaging
{
    [PlaceholderGroup("Lab", "lab", Modules = new[] { "lab" }, Order = 10)]
    public class LabTest : Entity
    {
        #region Core Lab Test Table (27)
        [Placeholder(Label = "Test Name", Example = "Complete Blood Count")]
        public string TestName { get; private set; }

        [Placeholder(Label = "Test Code", Example = "LAB-CBC-001")]
        public string? TestCode { get; private set; }

        [Placeholder(Label = "Category ID", Example = "3e2f1a9b-7d6c-4f8b-9a1e-5c3d7e9f2b11")]
        public Guid CategoryId { get; private set; }

        [Placeholder(
            Label = "Description",
            Example = "Measures red blood cells, white blood cells, hemoglobin, and platelets."
        )]
        public string? Description { get; private set; }

        [Placeholder(Label = "Sample Type", Example = "Venous Blood")]
        public string? SampleType { get; private set; }

        [Placeholder(Label = "Sample Volume", Example = "5 mL")]
        public string? SampleVolume { get; private set; }

        [Placeholder(
            Label = "Collection Instructions",
            Example = "Collect sample in EDTA tube and mix gently."
        )]
        public string? CollectionInstructions { get; private set; }

        [Placeholder(Label = "Preparation Required", Example = "true")]
        public bool PreparationRequired { get; private set; }

        [Placeholder(
            Label = "Preparation Instructions",
            Example = "Avoid alcohol and strenuous exercise 24 hours before the test."
        )]
        public string? PreparationInstructions { get; private set; }

        [Placeholder(Label = "Fasting Required", Example = "true")]
        public bool FastingRequired { get; private set; }

        [Placeholder(Label = "Fasting Hours", Example = "8")]
        public int FastingHours { get; private set; }

        [Placeholder(Label = "Normal Range Male", Example = "13.5 - 17.5 g/dL")]
        public string? NormalRangeMale { get; private set; }

        [Placeholder(Label = "Normal Range Female", Example = "12.0 - 15.5 g/dL")]
        public string? NormalRangeFemale { get; private set; }

        [Placeholder(Label = "Normal Pediatric Range", Example = "11.0 - 16.0 g/dL")]
        public string? NormalPediatric { get; private set; }

        [Placeholder(Label = "Unit Of Measurement", Example = "mg/dL")]
        public string? UnitOfMeasurement { get; private set; }

        [Placeholder(Label = "Methodology", Example = "Automated Hematology Analyzer")]
        public string? Methodology { get; private set; }

        [Placeholder(Label = "Reporting Time (Hours)", Example = "24")]
        public int ReportingTimeHours { get; private set; }

        [Placeholder(Label = "Cost", Example = "350000")]
        public decimal Cost { get; private set; }

        [Placeholder(Label = "Is Profile Test", Example = "false")]
        public bool IsProfile { get; private set; }

        [Placeholder(Label = "Urgent Service Available", Example = "true")]
        public bool IsUrgentAvailable { get; private set; }

        [Placeholder(Label = "Urgent Cost", Example = "500000")]
        public decimal UrgentCost { get; private set; }

        [Placeholder(Label = "Urgent Reporting Time (Hours)", Example = "4")]
        public int UrgentReportingTimeHours { get; private set; }

        [Placeholder(Label = "Home Collection Available", Example = "true")]
        public bool IsHomeCollectionAvailable { get; private set; }

        [Placeholder(Label = "Home Collection Charge", Example = "100000")]
        public decimal HomeCollectionCharge { get; private set; }

        [Placeholder(Label = "Requires Appointment", Example = "false")]
        public bool RequiresAppoinment { get; private set; }

        [Placeholder(Label = "Is Active", Example = "true")]
        public bool IsActive { get; private set; }

        [Placeholder(Label = "Created At", Example = "2026-05-24 10:15:00")]
        public DateTime CreatedAt { get; private set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public NpgsqlTsVector? SearchVector { get; private set; }

        public virtual LabTestCategory? Category { get; private set; }

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
