using PhysioBoo.Application.Commands.MedicineCategories.CreateMedicineCategory;
using PhysioBoo.Domain.Errors;
using Xunit;

namespace PhysioBoo.Application.Test.Commands.MedicineCategories.CreateMedicineCategory
{
    public sealed class CreateMedicineCategoryCommandValidationTest : ValidationTestBase<CreateMedicineCategoryCommand, CreateMedicineCategoryCommandValidation>
    {
        public CreateMedicineCategoryCommandValidationTest() : base(new CreateMedicineCategoryCommandValidation())
        {

        }

        [Fact]
        public void Should_Be_Valid()
        {
            CreateMedicineCategoryCommand command = CreateTestCommand();

            ShouldBeValid(command);
        }

        [Fact]
        public void Should_Fail_When_Name_Is_Empty()
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

            ShouldHaveSingleError(command, DomainErrorCodes.MedicineCategory.EmptyName);
        }

        private static CreateMedicineCategoryCommand CreateTestCommand()
        {
            return new CreateMedicineCategoryCommand(
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
        }
    }
}
