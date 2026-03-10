using PhysioBoo.Domain.Entities.LaboratoryImaging;

namespace PhysioBoo.Application.ViewModels.LabTests
{
    public sealed class LabTestViewModel
    {
        public Guid Id { get; set; }
        public string TestName { get; set; } = string.Empty;
        public string? TestCode { get; set; }
        public Guid CategoryId { get; set; }
        public string? Description { get; set; }
        public string? SampleType { get; set; }
        public string? SampleVolume { get; set; }
        public string? CollectionInstructions { get; set; }
        public bool PreparationRequired { get; set; }
        public string? PreparationInstructions { get; set; }
        public bool FastingRequired { get; set; }
        public int FastingHours { get; set; }
        public string? NormalRangeMale { get; set; }
        public string? NormalRangeFemale { get; set; }
        public string? NormalPediatric { get; set; }
        public string? UnitOfMeasurement { get; set; }
        public string? Methodology { get; set; }
        public int ReportingTimeHours { get; set; }
        public decimal Cost { get; set; }
        public bool IsProfile { get; set; }
        public bool IsUrgentAvailable { get; set; }
        public decimal UrgentCost { get; set; }
        public int UrgentReportingTimeHours { get; set; }
        public bool IsHomeCollectionAvailable { get; set; }
        public decimal HomeCollectionCharge { get; set; }
        public bool RequiresAppoinment { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

        public static LabTestViewModel FromLabTest(LabTest labTest)
        {
            return new LabTestViewModel
            {
                Id = labTest.Id,
                TestName = labTest.TestName,
                TestCode = labTest.TestCode,
                CategoryId = labTest.CategoryId,
                Description = labTest.Description,
                SampleType = labTest.SampleType,
                SampleVolume = labTest.SampleVolume,
                CollectionInstructions = labTest.CollectionInstructions,
                PreparationRequired = labTest.PreparationRequired,
                PreparationInstructions = labTest.PreparationInstructions,
                FastingRequired = labTest.FastingRequired,
                FastingHours = labTest.FastingHours,
                NormalRangeMale = labTest.NormalRangeMale,
                NormalRangeFemale = labTest.NormalRangeFemale,
                NormalPediatric = labTest.NormalPediatric,
                UnitOfMeasurement = labTest.UnitOfMeasurement,
                Methodology = labTest.Methodology,
                ReportingTimeHours = labTest.ReportingTimeHours,
                Cost = labTest.Cost,
                IsProfile = labTest.IsProfile,
                IsUrgentAvailable = labTest.IsUrgentAvailable,
                UrgentCost = labTest.UrgentCost,
                UrgentReportingTimeHours = labTest.UrgentReportingTimeHours,
                IsHomeCollectionAvailable = labTest.IsHomeCollectionAvailable,
                HomeCollectionCharge = labTest.HomeCollectionCharge,
                RequiresAppoinment = labTest.RequiresAppoinment,
                IsActive = labTest.IsActive,
                CreatedAt = labTest.CreatedAt
            };
        }
    }
}
