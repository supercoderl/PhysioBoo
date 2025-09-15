using PhysioBoo.gRPC.Interfaces;

namespace PhysioBoo.gRPC
{
    public interface IPhysioBoo
    {
        IUsersContext Users { get; }
    }
}
