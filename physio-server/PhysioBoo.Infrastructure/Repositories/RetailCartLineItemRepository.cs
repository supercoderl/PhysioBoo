using PhysioBoo.Domain.Entities.Clinical;

using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class RetailCartLineItemRepository : BaseRepository<RetailCartLineItem>, IRetailCartLineItemRepository
    {
        public RetailCartLineItemRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
