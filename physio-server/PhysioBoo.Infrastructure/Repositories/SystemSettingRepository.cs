using PhysioBoo.Domain.Entities.Core;

using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class SystemSettingRepository : BaseRepository<SystemSetting>, ISystemSettingRepository
    {
        public SystemSettingRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
