namespace PhysioBoo.Application.ViewModels.Nursing
{
    public sealed class NursingStatsViewModel
    {
        public int AssignedPatients { get; set; }
        public int OpenTasks { get; set; }
        public int OverdueTasks { get; set; }
        public int ActiveAlerts { get; set; }
    }
}
