using PhysioBoo.Application.Commands.AppointmentTypes.CreateAppointmentType;
using PhysioBoo.Domain.Errors;
using Xunit;

namespace PhysioBoo.Application.Test.Commands.AppointmentTypes.CreateAppointmentType
{
    public sealed class CreateAppointmentTypeCommandValidationTest : ValidationTestBase<CreateAppointmentTypeCommand, CreateAppointmentTypeCommandValidation>
    {
        public CreateAppointmentTypeCommandValidationTest() : base(new CreateAppointmentTypeCommandValidation())
        {

        }

        [Fact]
        public void Should_Be_Valid()
        {
            CreateAppointmentTypeCommand command = CreateTestCommand();

            ShouldBeValid(command);
        }

        [Fact]
        public void Should_Fail_When_Name_Is_Empty()
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

            ShouldHaveSingleError(command, DomainErrorCodes.AppointmentType.EmptyName);
        }

        private static CreateAppointmentTypeCommand CreateTestCommand()
        {
            return new CreateAppointmentTypeCommand(
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
        }
    }
}
