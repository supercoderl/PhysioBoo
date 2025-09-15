using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Domain.Interfaces
{
    public interface IUser
    {
        string Name { get; }
        Guid GetUserId();
        Role GetUserRole();
        string GetUserEmail();
    }
}
