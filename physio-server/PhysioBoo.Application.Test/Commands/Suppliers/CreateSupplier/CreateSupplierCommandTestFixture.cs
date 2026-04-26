using NSubstitute;
using PhysioBoo.Application.Commands.Suppliers.CreateSupplier;
using PhysioBoo.Domain.Entities.Support;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Results;

namespace PhysioBoo.Application.Test.Commands.Suppliers.CreateSupplier
{
    public sealed class CreateSupplierCommandTestFixture : CommandHandlerFixtureBase
    {
        public CreateSupplierCommandHandler CommandHandler { get; }
        public ISupplierRepository SupplierRepository { get; }
        public ISys_SequenceTrackerRepository Sys_SequenceTrackerRepository { get; }

        public CreateSupplierCommandTestFixture()
        {
            SupplierRepository = Substitute.For<ISupplierRepository>();
            Sys_SequenceTrackerRepository = Substitute.For<ISys_SequenceTrackerRepository>();

            CommandHandler = new CreateSupplierCommandHandler(
                Bus,
                UnitOfWork,
                NotificationHandler,
                SupplierRepository,
                Sys_SequenceTrackerRepository
            );
        }

        public void SetupInsertSuccess()
        {
            SupplierRepository
                .InsertAsync<Supplier, Guid>(Arg.Any<Supplier>())
                .Returns(DbResult<Guid>.Ok(Guid.NewGuid()));
        }

        public void SetupInsertFailure()
        {
            SupplierRepository
                .InsertAsync<Supplier, Guid>(Arg.Any<Supplier>())
                .Returns(DbResult<Guid>.Fail("Database error"));
        }
    }
}
