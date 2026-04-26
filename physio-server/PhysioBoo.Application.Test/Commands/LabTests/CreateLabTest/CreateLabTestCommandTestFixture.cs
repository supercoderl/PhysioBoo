using NSubstitute;
using PhysioBoo.Application.Commands.LabTests.CreateLabTest;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Results;

namespace PhysioBoo.Application.Test.Commands.LabTests.CreateLabTest
{
    public sealed class CreateLabTestCommandTestFixture : CommandHandlerFixtureBase
    {
        public CreateLabTestCommandHandler CommandHandler { get; }
        public ILabTestRepository LabTestRepository { get; }
        public ISys_SequenceTrackerRepository Sys_SequenceTrackerRepository { get; }

        public CreateLabTestCommandTestFixture()
        {
            LabTestRepository = Substitute.For<ILabTestRepository>();
            Sys_SequenceTrackerRepository = Substitute.For<ISys_SequenceTrackerRepository>();

            CommandHandler = new CreateLabTestCommandHandler(
                Bus,
                UnitOfWork,
                NotificationHandler,
                LabTestRepository,
                Sys_SequenceTrackerRepository
            );
        }

        public void SetupInsertSuccess()
        {
            LabTestRepository
                .InsertAsync<LabTest, Guid>(Arg.Any<LabTest>())
                .Returns(DbResult<Guid>.Ok(Guid.NewGuid()));
        }

        public void SetupInsertFailure()
        {
            LabTestRepository
                .InsertAsync<LabTest, Guid>(Arg.Any<LabTest>())
                .Returns(DbResult<Guid>.Fail("Database error"));
        }
    }
}
