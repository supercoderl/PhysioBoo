namespace PhysioBoo.Domain.Interfaces
{
    public interface IUser
    {
        string Name { get; }
        string? TimeZoneId { get; }
        Guid GetUserId();
        Guid GetTenantId();
        string GetUserRole();
        string GetUserEmail();
        bool IsAuthenticated { get; }

        // Request details recorded with sign-in sessions (null outside an HTTP request).
        string? UserAgent { get; }
        string? IpAddress { get; }
    }
}
