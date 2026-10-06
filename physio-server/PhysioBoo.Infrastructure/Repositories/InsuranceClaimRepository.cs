using PhysioBoo.Domain.Entities.Finance;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class InsuranceClaimRepository : BaseRepository<InsuranceClaim>, IInsuranceClaimRepository
    {
        public InsuranceClaimRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
