using PhysioBoo.gRPC.Interfaces;

namespace PhysioBoo.gRPC
{
    public sealed class PhysioBoo : IPhysioBoo
    {
        public PhysioBoo(
            IUsersContext users
        )
        {
            Users = users;
        }

        public IUsersContext Users { get; }
    }
}
