using NSubstitute;
using PhysioBoo.Application.Commands.Suppliers.CreateSupplier;
using PhysioBoo.Domain.Entities.Support;
using Xunit;

namespace PhysioBoo.Application.Test.Commands.Suppliers.CreateSupplier
{
    public sealed class CreateSupplierCommandHandlerTest
    {
        private readonly CreateSupplierCommandTestFixture _fixture = new();

        [Fact]
        public async Task Should_Create_Supplier()
        {
            _fixture.SetupInsertSuccess();

            CreateSupplierCommand command = new CreateSupplierCommand(new ViewModels.Suppliers.CreateSupplierViewModel(
                Guid.NewGuid(),
                "Test",
                Domain.Enums.SupplierType.General,
                null,
                null,
                null,
                null,
                null,
                "Test",
                "Test",
                "Test",
                null,
                "Test",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                false,
                null,
                0,
                null,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                null
            ));

            await _fixture.CommandHandler.Handle(command, default);
            _fixture.VerifyNoDomainNotification().VerifyNoCommit();
        }

        [Fact]
        public async Task Should_Raise_Notification_When_Insert_Fails()
        {
            _fixture.SetupInsertFailure();

            CreateSupplierCommand command = new CreateSupplierCommand(new ViewModels.Suppliers.CreateSupplierViewModel(
                Guid.NewGuid(),
                "Test",
                Domain.Enums.SupplierType.General,
                null,
                null,
                null,
                null,
                null,
                "Test",
                "Test",
                "Test",
                null,
                "Test",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                false,
                null,
                0,
                null,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                null
            ));

            await _fixture.CommandHandler.Handle(command, default);
            _fixture.VerifyAnyDomainNotification().VerifyNoCommit();
        }

        [Fact]
        public async Task Should_Raise_Notification_When_Command_Is_Invalid()
        {
            CreateSupplierCommand command = new CreateSupplierCommand(new ViewModels.Suppliers.CreateSupplierViewModel(
                Guid.NewGuid(),
                string.Empty,
                Domain.Enums.SupplierType.General,
                null,
                null,
                null,
                null,
                null,
                "Test",
                "Test",
                "Test",
                null,
                "Test",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                false,
                null,
                0,
                null,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                null
            ));

            await _fixture.CommandHandler.Handle(command, default);

            _fixture.VerifyAnyDomainNotification();
            await _fixture.SupplierRepository.DidNotReceive().InsertAsync<Supplier, Guid>(Arg.Any<Supplier>());
        }
    }
}
