namespace PhysioBoo.Application.ViewModels.TreatmentSheet
{
    public sealed class TreatmentStatsViewModel
    {
        public int ActiveOrders { get; set; }
        public int CompletedOrders { get; set; }
        public int PendingOrders { get; set; }
        public int MedicationDue { get; set; }
        public int CriticalAlerts { get; set; }
        public int PendingLabs { get; set; }
        public int PendingImaging { get; set; }
    }
}
