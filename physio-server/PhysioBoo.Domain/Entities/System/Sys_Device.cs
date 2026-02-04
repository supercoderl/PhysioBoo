using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.System
{
    public class Sys_Device : Entity
    {
        public Guid UserId { get; private set; }
        public string DeviceId { get; private set; }
        public string FcmToken { get; private set; }
        public Platform Platform { get; private set; }
        public DateTime LastActiveAt { get; private set; }

        [ForeignKey(nameof(UserId))]
        [InverseProperty(nameof(User.Sys_Devices))]
        public virtual User? User { get; private set; }

        public Sys_Device(
            Guid id,
            Guid userId,
            string deviceId,
            string fcmToken,
            Platform platform
        ) : base(id)
        {
            UserId = userId;
            DeviceId = deviceId;
            FcmToken = fcmToken;
            Platform = platform;
            LastActiveAt = TimeZoneHelper.GetLocalTimeNow();
        }

        public void SetUserId(Guid userId) { UserId = userId; }
        public void SetDeviceId(string deviceId) { DeviceId = deviceId; }
        public void SetFcmToken(string fcmToken) { FcmToken = fcmToken; }
        public void SetPlatform(Platform platform) { Platform = platform; }
        public void SetLastActiveAt(DateTime lastActiveAt) { LastActiveAt = lastActiveAt; }
    }
}
