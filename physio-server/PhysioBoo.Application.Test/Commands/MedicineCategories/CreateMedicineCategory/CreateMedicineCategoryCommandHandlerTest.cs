using NSubstitute;
using PhysioBoo.Application.Commands.MedicineCategories.CreateMedicineCategory;
using PhysioBoo.Domain.Entities.Clinical;
using Xunit;

namespace PhysioBoo.Application.Test.Commands.MedicineCategories.CreateMedicineCategory
{
    public sealed class CreateMedicineCategoryCommandHandlerTest
    {
        private readonly CreateMedicineCategoryCommandTestFixture _fixture = new();

        [Fact]
        public async Task Should_Create_MedicineCategory()
        {
            _fixture.SetupInsertSuccess();

            CreateMedicineCategoryCommand command = new CreateMedicineCategoryCommand(
                new ViewModels.MedicineCategories.CreateMedicineCategoryViewModel(
                    "Test",
                    null,
                    null,
                    false,
                    false,
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

            CreateMedicineCategoryCommand command = new CreateMedicineCategoryCommand(
                new ViewModels.MedicineCategories.CreateMedicineCategoryViewModel(
                    string.Empty,
                    null,
                    null,
                    false,
                    false,
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
            CreateMedicineCategoryCommand command = new CreateMedicineCategoryCommand(
                new ViewModels.MedicineCategories.CreateMedicineCategoryViewModel(
                    string.Empty,
                    null,
                    null,
                    false,
                    false,
                    null
                ),
                Guid.NewGuid()
            );

            await _fixture.CommandHandler.Handle(command, default);

            _fixture.VerifyAnyDomainNotification();
            await _fixture.MedicineCategoryRepository.DidNotReceive().InsertAsync<MedicineCategory, Guid>(Arg.Any<MedicineCategory>());
        }
    }
}
