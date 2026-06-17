using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace PhysioBoo.Infrastructure.Database
{
    public sealed class TenantModelCacheKeyFactory : IModelCacheKeyFactory
    {
        public object Create(DbContext context, bool designTime)
        {
            if (context is ApplicationDbContext db)
            {
                return (context.GetType(), db.CurrentTenantId, designTime);
            }
            return (context.GetType(), designTime);
        }

        public object Create(DbContext context) => Create(context, false);
    }
}
