namespace PhysioBoo.Application.ViewModels.Surgeries
{
    public sealed class SurgeryStatsViewModel
    {
        public int TotalScheduled { get; set; }
        public int Ongoing { get; set; }
        public int Completed { get; set; }
        public int Delayed { get; set; }
        public int Emergency { get; set; }
        public int AvailableRooms { get; set; }
        public int OccupiedRooms { get; set; }
        public int AverageDurationMinutes { get; set; }
        public decimal OrUtilizationRate { get; set; }          // percent, one decimal
    }

    public sealed class SurgeryTrendPointViewModel
    {
        public string Label { get; set; } = string.Empty;
        public decimal Value { get; set; }
    }

    public sealed class SurgeryTrendViewModel
    {
        public List<SurgeryTrendPointViewModel> OrUtilizationByRoom { get; set; } = new();
        public List<SurgeryTrendPointViewModel> SurgeryVolume { get; set; } = new();
        public decimal DelayRate { get; set; }
        public List<SurgeryTrendPointViewModel> EmergencyCases { get; set; } = new();
        public List<SurgeryTrendPointViewModel> ProcedureDistribution { get; set; } = new();
        public List<SurgeryTrendPointViewModel> AverageDuration { get; set; } = new();
        public decimal CancellationRate { get; set; }
    }
}
