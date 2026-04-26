using NSubstitute;
using PhysioBoo.Application.Commands.Manufacturers.CreateManufacturer;
using PhysioBoo.Domain.Entities.Support;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Results;

namespace PhysioBoo.Application.Test.Commands.Manufacturers.CreateManufacturer
{
    public sealed class CreateManufacturerCommandTestFixture : CommandHandlerFixtureBase
    {
        public CreateManufacturerCommandHandler CommandHandler { get; }
        public IManufacturerRepository ManufacturerRepository { get; }
        public ISys_SequenceTrackerRepository Sys_SequenceTrackerRepository { get; }

        public CreateManufacturerCommandTestFixture()
        {
            ManufacturerRepository = Substitute.For<IManufacturerRepository>();
            Sys_SequenceTrackerRepository = Substitute.For<ISys_SequenceTrackerRepository>();

            CommandHandler = new CreateManufacturerCommandHandler(
                Bus,
                UnitOfWork,
                NotificationHandler,
                ManufacturerRepository,
                Sys_SequenceTrackerRepository
            );
        }

        public void SetupInsertSuccess()
        {
            ManufacturerRepository
                .InsertAsync<Manufacturer, Guid>(Arg.Any<Manufacturer>())
                .Returns(DbResult<Guid>.Ok(Guid.NewGuid()));
        }

        public void SetupInsertFailure()
        {
            ManufacturerRepository
                .InsertAsync<Manufacturer, Guid>(Arg.Any<Manufacturer>())
                .Returns(DbResult<Guid>.Fail("Database error"));
        }
    }
}
