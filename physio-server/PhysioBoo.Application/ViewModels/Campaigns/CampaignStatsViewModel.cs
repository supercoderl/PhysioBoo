namespace PhysioBoo.Application.ViewModels.Campaigns
{
    public sealed class CampaignStatsViewModel
    {
        public int TotalCampaigns { get; set; }
        public int ActiveCampaigns { get; set; }
        public long TotalReach { get; set; }
        public long TotalConversions { get; set; }
    }
}
