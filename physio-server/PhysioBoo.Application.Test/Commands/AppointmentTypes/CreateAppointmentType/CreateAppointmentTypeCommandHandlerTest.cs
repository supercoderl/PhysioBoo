using NSubstitute;
using PhysioBoo.Application.Commands.AppointmentTypes.CreateAppointmentType;
using PhysioBoo.Domain.Entities.Operation;
using Xunit;

namespace PhysioBoo.Application.Test.Commands.AppointmentTypes.CreateAppointmentType
{
    public sealed class CreateAppointmentTypeCommandHandlerTest
    {
        private readonly CreateAppointmentTypeCommandTestFixture _fixture = new();

        [Fact]
        public async Task Should_Create_AppointmentType()
        {
            _fixture.SetupInsertSuccess();

            CreateAppointmentTypeCommand command = new CreateAppointmentTypeCommand(
                new ViewModels.AppointmentTypes.CreateAppointmentTypeViewModel(
                    "Test Street",
                    "123",
                    0,
                    0,
                    false,
                    false,
                    null,
                    true,
                    0,
                    null
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

            CreateAppointmentTypeCommand command = new CreateAppointmentTypeCommand(
                new ViewModels.AppointmentTypes.CreateAppointmentTypeViewModel(
                    "Test Street",
                    "123",
                    0,
                    0,
                    false,
                    false,
                    null,
                    true,
                    0,
                    null
                ),
                Guid.NewGuid()
            );

            await _fixture.CommandHandler.Handle(command, default);
            _fixture.VerifyAnyDomainNotification().VerifyNoCommit();
        }

        [Fact]
        public async Task Should_Raise_Notification_When_Command_Is_Invalid()
        {
            CreateAppointmentTypeCommand command = new CreateAppointmentTypeCommand(
                new ViewModels.AppointmentTypes.CreateAppointmentTypeViewModel(
                    string.Empty,
                    "123",
                    0,
                    0,
                    false,
                    false,
                    null,
                    true,
                    0,
                    null
                ),
                Guid.NewGuid()
            );

            await _fixture.CommandHandler.Handle(command, default);

            _fixture.VerifyAnyDomainNotification();
            await _fixture.AppointmentTypeRepository.DidNotReceive().InsertAsync<AppointmentType, Guid>(Arg.Any<AppointmentType>());
        }
    }
}
