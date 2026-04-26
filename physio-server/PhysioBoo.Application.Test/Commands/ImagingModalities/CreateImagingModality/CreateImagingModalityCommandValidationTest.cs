using PhysioBoo.Application.Commands.ImagingModalities.CreateImagingModality;
using PhysioBoo.Domain.Errors;
using Xunit;

namespace PhysioBoo.Application.Test.Commands.ImagingModalities.CreateImagingModality
{
    public sealed class CreateImagingModalityCommandValidationTest : ValidationTestBase<CreateImagingModalityCommand, CreateImagingModalityCommandValidation>
    {
        public CreateImagingModalityCommandValidationTest() : base(new CreateImagingModalityCommandValidation())
        {

        }

        [Fact]
        public void Should_Be_Valid()
        {
            CreateImagingModalityCommand command = CreateTestCommand();

            ShouldBeValid(command);
        }

        [Fact]
        public void Should_Fail_When_Name_Is_Empty()
        {
            CreateImagingModalityCommand command = new CreateImagingModalityCommand(new ViewModels.ImagingModalities.CreateImagingModalityViewModel(
                Guid.NewGuid(),
                string.Empty,
                "123",
                "Test City",
                "Test Category",
                false,
                false,
                null,
                0,
                0
            ));

            ShouldHaveSingleError(command, DomainErrorCodes.ImagingModality.EmptyName);
        }

        private static CreateImagingModalityCommand CreateTestCommand()
        {
            return new CreateImagingModalityCommand(new ViewModels.ImagingModalities.CreateImagingModalityViewModel(
                Guid.NewGuid(),
                "Test",
                "123",
                "Test City",
                "Test Category",
                false,
                false,
                null,
                0,
                0
            ));
        }
    }
}
