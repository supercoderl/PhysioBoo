using PhysioBoo.Application.Commands.Manufacturers.CreateManufacturer;
using PhysioBoo.Domain.Errors;
using Xunit;

namespace PhysioBoo.Application.Test.Commands.Manufacturers.CreateManufacturer
{
    public sealed class CreateManufacturerCommandValidationTest : ValidationTestBase<CreateManufacturerCommand, CreateManufacturerCommandValidation>
    {
        public CreateManufacturerCommandValidationTest() : base(new CreateManufacturerCommandValidation())
        {

        }

        [Fact]
        public void Should_Be_Valid()
        {
            CreateManufacturerCommand command = CreateTestCommand();

            ShouldBeValid(command);
        }

        [Fact]
        public void Should_Fail_When_Name_Is_Empty()
        {
            CreateManufacturerCommand command = new CreateManufacturerCommand(
                new ViewModels.Manufacturers.CreateManufacturerViewModel(
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
                ),
                Guid.NewGuid()
            );

            ShouldHaveSingleError(command, DomainErrorCodes.Manufacturer.EmptyName);
        }

        private static CreateManufacturerCommand CreateTestCommand()
        {
            return new CreateManufacturerCommand(
                new ViewModels.Manufacturers.CreateManufacturerViewModel(
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
                ),
                Guid.NewGuid()
            );
        }
    }
}
