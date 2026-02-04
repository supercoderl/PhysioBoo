using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Domain.Entities.System
{
    public class Sys_MediaFile : Entity
    {
        public string PublicId { get; private set; }
        public string Url { get; private set; }
        public string RefType { get; private set; }
        public Guid? RefId { get; private set; }
        public bool IsTemporary { get; private set; }
        public DateTime CreatedAt { get; private set; }

        public Sys_MediaFile(
            Guid id,
            string publicId,
            string url,
            string refType,
            Guid? refId
        ) : base(id)
        {
            PublicId = publicId;
            Url = url;
            RefType = refType;
            RefId = refId;
            IsTemporary = true;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
        }

        public void SetPublicId(string publicId) { PublicId = publicId; }
        public void SetUrl(string url) { Url = url; }
        public void SetRefType(string refType) { RefType = refType; }
        public void SetRefId(Guid? refId) { RefId = refId; }
        public void SetIsTemporary(bool isTemporary) { IsTemporary = isTemporary; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
    }
}
