using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class AppointmentTypeRepository : BaseRepository<AppointmentType>, IAppointmentTypeRepository
    {
        public AppointmentTypeRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
