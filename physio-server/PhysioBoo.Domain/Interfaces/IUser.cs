using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Domain.Interfaces
{
    public interface IUser
    {
        string Name { get; }
        string? TimeZoneId { get; }
        Guid GetUserId();
        Role GetUserRole();
        string GetUserEmail();
        bool IsAuthenticated { get; }
    }
}
