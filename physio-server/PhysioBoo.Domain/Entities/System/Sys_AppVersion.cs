using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Domain.Entities.System
{
    public class Sys_AppVersion : Entity
    {
        public string AppId { get; private set; }
        public Platform Platform { get; private set; }
        public string VersionNo { get; private set; }
        public string Title { get; private set; }
        public string Message { get; private set; }
        public bool IsForceUpdate { get; private set; }
        public string StoreUrl { get; private set; }
        public bool IsActive { get; private set; }

        public Sys_AppVersion(
            Guid id,
            string appId,
            Platform platform,
            string versionNo,
            string title,
            string message,
            bool isForceUpdate,
            string storeUrl
        ) : base(id)
        {
            AppId = appId;
            Platform = platform;
            VersionNo = versionNo;
            Title = title;
            Message = message;
            IsForceUpdate = isForceUpdate;
            StoreUrl = storeUrl;
            IsActive = true;
        }

        public void SetAppId(string appId) { AppId = appId; }
        public void SetPlatform(Platform platform) { Platform = platform; }
        public void SetVersionNo(string versionNo) { VersionNo = versionNo; }
        public void SetTitle(string title) { Title = title; }
        public void SetMessage(string message) { Message = message; }
        public void SetIsForceUpdate(bool isForceUpdate) { IsForceUpdate = isForceUpdate; }
        public void SetStoreUrl(string storeUrl) { StoreUrl = storeUrl; }
        public void SetIsActive(bool isActive) { IsActive = isActive; }
    }
}
