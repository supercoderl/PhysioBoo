using PhysioBoo.Application.Commands.LabTests.CreateLabTest;
using PhysioBoo.Domain.Errors;
using Xunit;

namespace PhysioBoo.Application.Test.Commands.LabTests.CreateLabTest
{
    public sealed class CreateLabTestCommandValidationTest : ValidationTestBase<CreateLabTestCommand, CreateLabTestCommandValidation>
    {
        public CreateLabTestCommandValidationTest() : base(new CreateLabTestCommandValidation())
        {

        }

        [Fact]
        public void Should_Be_Valid()
        {
            CreateLabTestCommand command = CreateTestCommand();

            ShouldBeValid(command);
        }

        [Fact]
        public void Should_Fail_When_Name_Is_Empty()
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

            ShouldHaveSingleError(command, DomainErrorCodes.LabTest.EmptyTestName);
        }

        [Fact]
        public void Should_Fail_When_Category_Id_Is_Empty()
        {
            CreateLabTestCommand command = new CreateLabTestCommand(new ViewModels.LabTests.CreateLabTestViewModel(
                Guid.NewGuid(),
                "Test",
                Guid.Empty,
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

            ShouldHaveSingleError(command, DomainErrorCodes.LabTest.EmptyCategoryId);
        }

        private static CreateLabTestCommand CreateTestCommand()
        {
            return new CreateLabTestCommand(new ViewModels.LabTests.CreateLabTestViewModel(
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
        }
    }
}
