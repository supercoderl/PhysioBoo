namespace PhysioBoo.Application.ViewModels.Leads
{
    public sealed class LeadStatsViewModel
    {
        public int TotalLeads { get; set; }
        public int NewLeads { get; set; }
        public int QualifiedLeads { get; set; }
        public int ConvertedLeads { get; set; }
    }
}
