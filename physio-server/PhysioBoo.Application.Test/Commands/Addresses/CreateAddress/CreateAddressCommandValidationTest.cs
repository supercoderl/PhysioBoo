using PhysioBoo.Application.Commands.Addresses.CreateAddress;
using PhysioBoo.Domain.Errors;
using Xunit;

namespace PhysioBoo.Application.Test.Commands.Addresses.CreateAddress
{
    public sealed class CreateAddressCommandValidationTest : ValidationTestBase<CreateAddressCommand, CreateAddressCommandValidation>
    {
        public CreateAddressCommandValidationTest() : base(new CreateAddressCommandValidation())
        {

        }

        [Fact]
        public void Should_Be_Valid()
        {
            CreateAddressCommand command = CreateTestCommand();

            ShouldBeValid(command);
        }

        [Fact]
        public void Should_Fail_When_Street_Is_Empty()
        {
            CreateAddressCommand command = new CreateAddressCommand(new ViewModels.Addresses.CreateAddressViewModel(
                Guid.NewGuid(),
                "",
                "123",
                "Test City",
                "Test State",
                "12345",
                "Test Country",
                0,
                0
            ));

            ShouldHaveSingleError(command, DomainErrorCodes.Address.EmptyStreet);
        }

        [Fact]
        public void Should_Fail_When_City_Is_Empty()
        {
            CreateAddressCommand command = new CreateAddressCommand(new ViewModels.Addresses.CreateAddressViewModel(
                Guid.NewGuid(),
                "Test Street",
                "123",
                "",
                "Test State",
                "12345",
                "Test Country",
                0,
                0
            ));

            ShouldHaveSingleError(command, DomainErrorCodes.Address.EmptyCity);
        }

        [Fact]
        public void Should_Fail_When_StateProvince_Is_Empty()
        {
            CreateAddressCommand command = new CreateAddressCommand(new ViewModels.Addresses.CreateAddressViewModel(
                Guid.NewGuid(),
                "Test Street",
                "123",
                "Test City",
                "",
                "12345",
                "Test Country",
                0,
                0
            ));

            ShouldHaveSingleError(command, DomainErrorCodes.Address.EmptyStateProvince);
        }

        [Fact]
        public void Should_Fail_When_Country_Is_Empty()
        {
            CreateAddressCommand command = new CreateAddressCommand(new ViewModels.Addresses.CreateAddressViewModel(
                Guid.NewGuid(),
                "Test Street",
                "123",
                "Test City",
                "Test State",
                "12345",
                "",
                0,
                0
            ));

            ShouldHaveSingleError(command, DomainErrorCodes.Address.EmptyCountry);
        }

        [Fact]
        public void Should_Fail_When_Latitude_Is_Out_Of_Range()
        {
            CreateAddressCommand command = new CreateAddressCommand(new ViewModels.Addresses.CreateAddressViewModel(
                Guid.NewGuid(),
                "Test Street",
                "123",
                "Test City",
                "Test State",
                "12345",
                "Test Country",
                91,
                0
            ));

            ShouldHaveSingleError(command, DomainErrorCodes.Address.InvalidGeographicCoordinate);
        }

        [Fact]
        public void Should_Fail_When_Longitude_Is_Out_Of_Range()
        {
            CreateAddressCommand command = new CreateAddressCommand(new ViewModels.Addresses.CreateAddressViewModel(
                Guid.NewGuid(),
                "Test Street",
                "123",
                "Test City",
                "Test State",
                "12345",
                "Test Country",
                0,
                91
            ));

            ShouldHaveSingleError(command, DomainErrorCodes.Address.InvalidGeographicCoordinate);
        }

        private static CreateAddressCommand CreateTestCommand()
        {
            return new CreateAddressCommand(new ViewModels.Addresses.CreateAddressViewModel(
                Guid.NewGuid(),
                "Test Street",
                "123",
                "Test City",
                "Test State",
                "12345",
                "Test Country",
                0,
                0
            ));
        }
    }
}
