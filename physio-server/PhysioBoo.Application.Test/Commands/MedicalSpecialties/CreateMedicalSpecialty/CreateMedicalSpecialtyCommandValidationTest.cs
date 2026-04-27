using PhysioBoo.Application.Commands.MedicalSpecialties.CreateMedicalSpecialty;
using PhysioBoo.Domain.Errors;
using Xunit;

namespace PhysioBoo.Application.Test.Commands.MedicalSpecialties.CreateMedicalSpecialty
{
    public sealed class CreateMedicalSpecialtyCommandValidationTest : ValidationTestBase<CreateMedicalSpecialtyCommand, CreateMedicalSpecialtyCommandValidation>
    {
        public CreateMedicalSpecialtyCommandValidationTest() : base(new CreateMedicalSpecialtyCommandValidation())
        {

        }

        [Fact]
        public void Should_Be_Valid()
        {
            CreateMedicalSpecialtyCommand command = CreateTestCommand();

            ShouldBeValid(command);
        }

        [Fact]
        public void Should_Fail_When_Name_Is_Empty()
        {
            CreateMedicalSpecialtyCommand command = new CreateMedicalSpecialtyCommand(
                new ViewModels.MedicalSpecialties.CreateMedicalSpecialtyViewModel(
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
                ),
                Guid.NewGuid()
            );

            ShouldHaveSingleError(command, DomainErrorCodes.MedicalSpecialty.EmptyName);
        }

        private static CreateMedicalSpecialtyCommand CreateTestCommand()
        {
            return new CreateMedicalSpecialtyCommand(
                new ViewModels.MedicalSpecialties.CreateMedicalSpecialtyViewModel(
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
                ),
                Guid.NewGuid()
            );
        }
    }
}
