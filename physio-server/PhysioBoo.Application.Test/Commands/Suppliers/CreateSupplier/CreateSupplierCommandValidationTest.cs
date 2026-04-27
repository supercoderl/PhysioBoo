using PhysioBoo.Application.Commands.Suppliers.CreateSupplier;
using PhysioBoo.Domain.Errors;
using Xunit;

namespace PhysioBoo.Application.Test.Commands.Suppliers.CreateSupplier
{
    public sealed class CreateSupplierCommandValidationTest : ValidationTestBase<CreateSupplierCommand, CreateSupplierCommandValidation>
    {
        public CreateSupplierCommandValidationTest() : base(new CreateSupplierCommandValidation())
        {

        }

        [Fact]
        public void Should_Be_Valid()
        {
            CreateSupplierCommand command = CreateTestCommand();

            ShouldBeValid(command);
        }

        [Fact]
        public void Should_Fail_When_Supplier_Name_Is_Empty()
        {
            CreateSupplierCommand command = new CreateSupplierCommand(
                new ViewModels.Suppliers.CreateSupplierViewModel(
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
                ),
                Guid.NewGuid()
            );

            ShouldHaveSingleError(command, DomainErrorCodes.Supplier.EmptySupplierName);
        }

        [Fact]
        public void Should_Fail_When_City_Is_Empty()
        {
            CreateSupplierCommand command = new CreateSupplierCommand(
                new ViewModels.Suppliers.CreateSupplierViewModel(
                    "Test",
                    Domain.Enums.SupplierType.General,
                    null,
                    null,
                    null,
                    null,
                    null,
                    "Test",
                    string.Empty,
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
                ),
                Guid.NewGuid()
            );

            ShouldHaveSingleError(command, DomainErrorCodes.Supplier.EmptyCity);
        }

        [Fact]
        public void Should_Fail_When_Address_Is_Empty()
        {
            CreateSupplierCommand command = new CreateSupplierCommand(
                new ViewModels.Suppliers.CreateSupplierViewModel(
                    "Test",
                    Domain.Enums.SupplierType.General,
                    null,
                    null,
                    null,
                    null,
                    null,
                    string.Empty,
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
                ),
                Guid.NewGuid()
            );

            ShouldHaveSingleError(command, DomainErrorCodes.Supplier.EmptyAddress);
        }

        [Fact]
        public void Should_Fail_When_Country_Is_Empty()
        {
            CreateSupplierCommand command = new CreateSupplierCommand(
                new ViewModels.Suppliers.CreateSupplierViewModel(
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
                    string.Empty,
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
                ),
                Guid.NewGuid()
            );

            ShouldHaveSingleError(command, DomainErrorCodes.Supplier.EmptyCountry);
        }

        [Fact]
        public void Should_Fail_When_State_Province_Is_Empty()
        {
            CreateSupplierCommand command = new CreateSupplierCommand(
                new ViewModels.Suppliers.CreateSupplierViewModel(
                    "Test",
                    Domain.Enums.SupplierType.General,
                    null,
                    null,
                    null,
                    null,
                    null,
                    "Test",
                    "Test",
                    string.Empty,
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
                ),
                Guid.NewGuid()
            );

            ShouldHaveSingleError(command, DomainErrorCodes.Supplier.EmptyStateProvince);
        }

        private static CreateSupplierCommand CreateTestCommand()
        {
            return new CreateSupplierCommand(
                new ViewModels.Suppliers.CreateSupplierViewModel(
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
                ),
                Guid.NewGuid()
            );
        }
    }
}
