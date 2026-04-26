using NSubstitute;
using PhysioBoo.Application.Commands.InsuranceCompanies.CreateInsuranceCompany;
using PhysioBoo.Domain.Entities.Support;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Results;

namespace PhysioBoo.Application.Test.Commands.InsuranceCompanies.CreateInsuranceCompany
{
    public sealed class CreateInsuranceCompanyCommandTestFixture : CommandHandlerFixtureBase
    {
        public CreateInsuranceCompanyCommandHandler CommandHandler { get; }
        public IInsuranceCompanyRepository InsuranceCompanyRepository { get; }
        public ISys_SequenceTrackerRepository Sys_SequenceTrackerRepository { get; }

        public CreateInsuranceCompanyCommandTestFixture()
        {
            InsuranceCompanyRepository = Substitute.For<IInsuranceCompanyRepository>();
            Sys_SequenceTrackerRepository = Substitute.For<ISys_SequenceTrackerRepository>();

            CommandHandler = new CreateInsuranceCompanyCommandHandler(
                Bus,
                UnitOfWork,
                NotificationHandler,
                InsuranceCompanyRepository,
                Sys_SequenceTrackerRepository
            );
        }

        public void SetupInsertSuccess()
        {
            InsuranceCompanyRepository
                .InsertAsync<InsuranceCompany, Guid>(Arg.Any<InsuranceCompany>())
                .Returns(DbResult<Guid>.Ok(Guid.NewGuid()));
        }

        public void SetupInsertFailure()
        {
            InsuranceCompanyRepository
                .InsertAsync<InsuranceCompany, Guid>(Arg.Any<InsuranceCompany>())
                .Returns(DbResult<Guid>.Fail("Database error"));
        }
    }
}
