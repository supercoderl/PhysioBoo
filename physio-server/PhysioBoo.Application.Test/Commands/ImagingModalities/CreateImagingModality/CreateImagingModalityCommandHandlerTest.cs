using NSubstitute;
using PhysioBoo.Application.Commands.ImagingModalities.CreateImagingModality;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using Xunit;

namespace PhysioBoo.Application.Test.Commands.ImagingModalities.CreateImagingModality
{
    public sealed class CreateImagingModalityCommandHandlerTest
    {
        private readonly CreateImagingModalityCommandTestFixture _fixture = new();

        [Fact]
        public async Task Should_Create_ImagingModality()
        {
            _fixture.SetupInsertSuccess();

            CreateImagingModalityCommand command = new CreateImagingModalityCommand(
                new ViewModels.ImagingModalities.CreateImagingModalityViewModel(
                    "Test",
                    "123",
                    "Test City",
                    "Test Category",
                    false,
                    false,
                    null,
                    0,
                    0
                ),
                Guid.NewGuid()
            );

            await _fixture.CommandHandler.Handle(command, default);
            _fixture.VerifyNoDomainNotification().VerifyNoCommit();
        }

        [Fact]
        public async Task Should_Raise_Notification_When_Insert_Fails()
        {
            _fixture.SetupInsertFailure();

            CreateImagingModalityCommand command = new CreateImagingModalityCommand(
                new ViewModels.ImagingModalities.CreateImagingModalityViewModel(
                    string.Empty,
                    "123",
                    "Test City",
                    "Test Category",
                    false,
                    false,
                    null,
                    0,
                    0
                ),
                Guid.NewGuid()
            );

            await _fixture.CommandHandler.Handle(command, default);
            _fixture.VerifyAnyDomainNotification().VerifyNoCommit();
        }

        [Fact]
        public async Task Should_Raise_Notification_When_Command_Is_Invalid()
        {
            CreateImagingModalityCommand command = new CreateImagingModalityCommand(
                new ViewModels.ImagingModalities.CreateImagingModalityViewModel(
                    string.Empty,
                    "123",
                    "Test City",
                    "Test Category",
                    false,
                    false,
                    null,
                    0,
                    0
                ),
                Guid.NewGuid()
            );

            await _fixture.CommandHandler.Handle(command, default);

            _fixture.VerifyAnyDomainNotification();
            await _fixture.ImagingModalityRepository.DidNotReceive().InsertAsync<ImagingModality, Guid>(Arg.Any<ImagingModality>());
        }
    }
}
