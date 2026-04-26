using NSubstitute;
using PhysioBoo.Application.Commands.MedicalSpecialties.CreateMedicalSpecialty;
using PhysioBoo.Domain.Entities.MedicalStaff;
using Xunit;

namespace PhysioBoo.Application.Test.Commands.MedicalSpecialties.CreateMedicalSpecialty
{
    public sealed class CreateMedicalSpecialtyCommandHandlerTest
    {
        private readonly CreateMedicalSpecialtyCommandTestFixture _fixture = new();

        [Fact]
        public async Task Should_Create_MedicalSpecialty()
        {
            _fixture.SetupInsertSuccess();

            CreateMedicalSpecialtyCommand command = new CreateMedicalSpecialtyCommand(new ViewModels.MedicalSpecialties.CreateMedicalSpecialtyViewModel(
                Guid.NewGuid(),
                "Test",
                null,
                null,
                false,
                false,
                0,
                null,
                null,
                null,
                null,
                null
            ));

            await _fixture.CommandHandler.Handle(command, default);
            _fixture.VerifyNoDomainNotification().VerifyNoCommit();
        }

        [Fact]
        public async Task Should_Raise_Notification_When_Insert_Fails()
        {
            _fixture.SetupInsertFailure();

            CreateMedicalSpecialtyCommand command = new CreateMedicalSpecialtyCommand(new ViewModels.MedicalSpecialties.CreateMedicalSpecialtyViewModel(
                Guid.NewGuid(),
                string.Empty,
                null,
                null,
                false,
                false,
                0,
                null,
                null,
                null,
                null,
                null
            ));

            await _fixture.CommandHandler.Handle(command, default);
            _fixture.VerifyAnyDomainNotification().VerifyNoCommit();
        }

        [Fact]
        public async Task Should_Raise_Notification_When_Command_Is_Invalid()
        {
            CreateMedicalSpecialtyCommand command = new CreateMedicalSpecialtyCommand(new ViewModels.MedicalSpecialties.CreateMedicalSpecialtyViewModel(
                Guid.NewGuid(),
                string.Empty,
                null,
                null,
                false,
                false,
                0,
                null,
                null,
                null,
                null,
                null
            ));

            await _fixture.CommandHandler.Handle(command, default);

            _fixture.VerifyAnyDomainNotification();
            await _fixture.MedicalSpecialtyRepository.DidNotReceive().InsertAsync<MedicalSpecialty, Guid>(Arg.Any<MedicalSpecialty>());
        }
    }
}
