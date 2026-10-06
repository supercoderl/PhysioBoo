namespace PhysioBoo.Application.ViewModels.Complaints
{
    public sealed class ComplaintStatsViewModel
    {
        public int Total { get; set; }
        public int Pending { get; set; }
        public int InProgress { get; set; }
        public int Resolved { get; set; }
    }
}
