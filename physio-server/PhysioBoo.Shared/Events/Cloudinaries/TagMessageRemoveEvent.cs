using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Shared.Events.Cloudinaries
{
    public sealed class TagMessageRemoveEvent
    {
        public string PublicId { get; set; } = string.Empty;
        public string Tag { get; set; } = "temporary";
        public DateTime CreatedAt { get; set; } = TimeZoneHelper.GetLocalTimeNow();
    }
}
