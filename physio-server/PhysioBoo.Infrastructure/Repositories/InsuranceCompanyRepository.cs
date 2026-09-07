using PhysioBoo.Domain.Entities.Support;

using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class InsuranceCompanyRepository : BaseRepository<InsuranceCompany>, IInsuranceCompanyRepository
    {
        public InsuranceCompanyRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
