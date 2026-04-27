using NSubstitute;
using PhysioBoo.Application.Commands.Addresses.CreateAddress;
using PhysioBoo.Domain.Entities.Core;
using Xunit;

namespace PhysioBoo.Application.Test.Commands.Addresses.CreateAddress
{
    public sealed class CreateAddressCommandHandlerTest
    {
        private readonly CreateAddressCommandTestFixture _fixture = new();

        [Fact]
        public async Task Should_Create_Address()
        {
            _fixture.SetupInsertSuccess();

            CreateAddressCommand command = new CreateAddressCommand(
                Guid.NewGuid(),
                new ViewModels.Addresses.CreateAddressViewModel(
                    "123 Main St",
                    "Apt 4B",
                    "Springfield",
                    "IL",
                    "62704",
                    "USA",
                    0,
                    0,
                    false
                )
            );

            await _fixture.CommandHandler.Handle(command, default);
            _fixture.VerifyNoDomainNotification().VerifyNoCommit();
        }

        [Fact]
        public async Task Should_Raise_Notification_When_Insert_Fails()
        {
            _fixture.SetupInsertFailure();

            CreateAddressCommand command = new CreateAddressCommand(
                Guid.NewGuid(),
                new ViewModels.Addresses.CreateAddressViewModel(
                    "123 Main St",
                    "Apt 4B",
                    "Springfield",
                    "IL",
                    "62704",
                    "USA",
                    0,
                    0,
                    false
                )
            );

            await _fixture.CommandHandler.Handle(command, default);
            _fixture.VerifyAnyDomainNotification().VerifyNoCommit();
        }

        [Fact]
        public async Task Should_Raise_Notification_When_Command_Is_Invalid()
        {
            CreateAddressCommand command = new CreateAddressCommand(
                Guid.NewGuid(),
                new ViewModels.Addresses.CreateAddressViewModel(
                    "",
                    null,
                    "Springfield",
                    "IL",
                    "62704",
                    "USA",
                    0,
                    0,
                    false
                )
            );

            await _fixture.CommandHandler.Handle(command, default);

            _fixture.VerifyAnyDomainNotification();
            await _fixture.AddressRepository.DidNotReceive().InsertAsync<Address, Guid>(Arg.Any<Address>());
        }
    }
}
