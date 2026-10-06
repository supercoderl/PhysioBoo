namespace PhysioBoo.Application.ViewModels.BedMap
{
    public sealed class BedMapStatsViewModel
    {
        public int TotalBeds { get; set; }
        public int AvailableBeds { get; set; }
        public int OccupiedBeds { get; set; }
        public int MaintenanceBeds { get; set; }
        public int ReservedBeds { get; set; }
        public double OccupancyRate { get; set; }   // percent, one decimal
    }
}
