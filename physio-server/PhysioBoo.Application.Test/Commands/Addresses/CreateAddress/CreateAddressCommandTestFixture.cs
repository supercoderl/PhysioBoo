using NSubstitute;
using PhysioBoo.Application.Commands.Addresses.CreateAddress;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Results;

namespace PhysioBoo.Application.Test.Commands.Addresses.CreateAddress
{
    public sealed class CreateAddressCommandTestFixture : CommandHandlerFixtureBase
    {
        public CreateAddressCommandHandler CommandHandler { get; }
        public IAddressRepository AddressRepository { get; }

        public CreateAddressCommandTestFixture()
        {
            AddressRepository = Substitute.For<IAddressRepository>();

            CommandHandler = new CreateAddressCommandHandler(
                Bus,
                UnitOfWork,
                NotificationHandler,
                AddressRepository,
                User
            );
        }

        public void SetupInsertSuccess()
        {
            AddressRepository
                .InsertAsync<Address, Guid>(Arg.Any<Address>())
                .Returns(DbResult<Guid>.Ok(Guid.NewGuid()));
        }

        public void SetupInsertFailure()
        {
            AddressRepository
                .InsertAsync<Address, Guid>(Arg.Any<Address>())
                .Returns(DbResult<Guid>.Fail("Database error"));
        }
    }
}
