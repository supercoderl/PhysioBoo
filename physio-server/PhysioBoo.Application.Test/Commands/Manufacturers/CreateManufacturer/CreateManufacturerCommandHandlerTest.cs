using NSubstitute;
using PhysioBoo.Application.Commands.Manufacturers.CreateManufacturer;
using PhysioBoo.Domain.Entities.Support;
using Xunit;

namespace PhysioBoo.Application.Test.Commands.Manufacturers.CreateManufacturer
{
    public sealed class CreateManufacturerCommandHandlerTest
    {
        private readonly CreateManufacturerCommandTestFixture _fixture = new();

        [Fact]
        public async Task Should_Create_Manufacturer()
        {
            _fixture.SetupInsertSuccess();

            CreateManufacturerCommand command = new CreateManufacturerCommand(new ViewModels.Manufacturers.CreateManufacturerViewModel(
                Guid.NewGuid(),
                "Test",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                false,
                false,
                false,
                0
            ));

            await _fixture.CommandHandler.Handle(command, default);
            _fixture.VerifyNoDomainNotification().VerifyNoCommit();
        }

        [Fact]
        public async Task Should_Raise_Notification_When_Insert_Fails()
        {
            _fixture.SetupInsertFailure();

            CreateManufacturerCommand command = new CreateManufacturerCommand(new ViewModels.Manufacturers.CreateManufacturerViewModel(
                Guid.NewGuid(),
                string.Empty,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                false,
                false,
                false,
                0
            ));

            await _fixture.CommandHandler.Handle(command, default);
            _fixture.VerifyAnyDomainNotification().VerifyNoCommit();
        }

        [Fact]
        public async Task Should_Raise_Notification_When_Command_Is_Invalid()
        {
            CreateManufacturerCommand command = new CreateManufacturerCommand(new ViewModels.Manufacturers.CreateManufacturerViewModel(
                Guid.NewGuid(),
                string.Empty,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                false,
                false,
                false,
                0
            ));

            await _fixture.CommandHandler.Handle(command, default);

            _fixture.VerifyAnyDomainNotification();
            await _fixture.ManufacturerRepository.DidNotReceive().InsertAsync<Manufacturer, Guid>(Arg.Any<Manufacturer>());
        }
    }
}
