namespace PhysioBoo.Application.ViewModels.BedMap
{
    public sealed class BedMapSnapshotViewModel
    {
        public List<WardViewModel> Wards { get; set; } = new();
        public List<BedViewModel> Beds { get; set; } = new();
    }
}
