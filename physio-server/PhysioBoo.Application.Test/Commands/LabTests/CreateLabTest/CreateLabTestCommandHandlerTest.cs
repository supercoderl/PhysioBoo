using NSubstitute;
using PhysioBoo.Application.Commands.LabTests.CreateLabTest;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using Xunit;

namespace PhysioBoo.Application.Test.Commands.LabTests.CreateLabTest
{
    public sealed class CreateLabTestCommandHandlerTest
    {
        private readonly CreateLabTestCommandTestFixture _fixture = new();

        [Fact]
        public async Task Should_Create_LabTest()
        {
            _fixture.SetupInsertSuccess();

            CreateLabTestCommand command = new CreateLabTestCommand(new ViewModels.LabTests.CreateLabTestViewModel(
                Guid.NewGuid(),
                "Test",
                Guid.NewGuid(),
                null,
                null,
                null,
                null,
                false,
                null,
                false,
                0,
                null,
                null,
                null,
                null,
                null,
                0,
                0,
                false,
                false,
                0,
                0,
                false,
                0,
                false
            ));

            await _fixture.CommandHandler.Handle(command, default);
            _fixture.VerifyNoDomainNotification().VerifyNoCommit();
        }

        [Fact]
        public async Task Should_Raise_Notification_When_Insert_Fails()
        {
            _fixture.SetupInsertFailure();

            CreateLabTestCommand command = new CreateLabTestCommand(new ViewModels.LabTests.CreateLabTestViewModel(
                Guid.NewGuid(),
                string.Empty,
                Guid.NewGuid(),
                null,
                null,
                null,
                null,
                false,
                null,
                false,
                0,
                null,
                null,
                null,
                null,
                null,
                0,
                0,
                false,
                false,
                0,
                0,
                false,
                0,
                false
            ));

            await _fixture.CommandHandler.Handle(command, default);
            _fixture.VerifyAnyDomainNotification().VerifyNoCommit();
        }

        [Fact]
        public async Task Should_Raise_Notification_When_Command_Is_Invalid()
        {
            CreateLabTestCommand command = new CreateLabTestCommand(new ViewModels.LabTests.CreateLabTestViewModel(
                Guid.NewGuid(),
                string.Empty,
                Guid.NewGuid(),
                null,
                null,
                null,
                null,
                false,
                null,
                false,
                0,
                null,
                null,
                null,
                null,
                null,
                0,
                0,
                false,
                false,
                0,
                0,
                false,
                0,
                false
            ));

            await _fixture.CommandHandler.Handle(command, default);

            _fixture.VerifyAnyDomainNotification();
            await _fixture.LabTestRepository.DidNotReceive().InsertAsync<LabTest, Guid>(Arg.Any<LabTest>());
        }
    }
}
