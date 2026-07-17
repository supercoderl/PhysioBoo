namespace PhysioBoo.Application.ViewModels.MedicalRecords
{
    public sealed class HistoricalSummaryViewModel
    {
        public string? PastMedicalHistory { get; set; }
        public string? FamilyHistory { get; set; }
        public string? SocialHistory { get; set; }
        public string? ReviewOfSystems { get; set; }
        public string? LastUpdatedAt { get; set; }
        public string? LastUpdatedByName { get; set; }

        public static HistoricalSummaryViewModel FromEntity(
            string pastMedicalHistory,
            string familyHistory,
            string socialHistory,
            string reviewOfSystems,
            string lastUpdatedAt,
            string lastUpdatedByName
        )
        {
            return new HistoricalSummaryViewModel
            {
                PastMedicalHistory = pastMedicalHistory,
                FamilyHistory = familyHistory,
                SocialHistory = socialHistory,
                ReviewOfSystems = reviewOfSystems,
                LastUpdatedAt = lastUpdatedAt,
                LastUpdatedByName = lastUpdatedByName
            };
        }

        public static HistoricalSummaryViewModel NewData()
        {
            return new();
        }
    }
}
