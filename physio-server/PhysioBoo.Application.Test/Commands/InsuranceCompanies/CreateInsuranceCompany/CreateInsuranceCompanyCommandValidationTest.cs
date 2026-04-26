using PhysioBoo.Application.Commands.InsuranceCompanies.CreateInsuranceCompany;
using PhysioBoo.Domain.Errors;
using Xunit;

namespace PhysioBoo.Application.Test.Commands.InsuranceCompanies.CreateInsuranceCompany
{
    public sealed class CreateInsuranceCompanyCommandValidationTest : ValidationTestBase<CreateInsuranceCompanyCommand, CreateInsuranceCompanyCommandValidation>
    {
        public CreateInsuranceCompanyCommandValidationTest() : base(new CreateInsuranceCompanyCommandValidation())
        {

        }

        [Fact]
        public void Should_Be_Valid()
        {
            CreateInsuranceCompanyCommand command = CreateTestCommand();

            ShouldBeValid(command);
        }

        [Fact]
        public void Should_Fail_When_Name_Is_Empty()
        {
            CreateInsuranceCompanyCommand command = new CreateInsuranceCompanyCommand(new ViewModels.InsuranceCompanies.CreateInsuranceCompanyViewModel(
                Guid.NewGuid(),
                string.Empty,
                Domain.Enums.InsuranceType.Health,
                null,
                null,
                null,
                null,
                null,
                false,
                false,
                null,
                0,
                0,
                0,
                ["Test"],
                null
            ));

            ShouldHaveSingleError(command, DomainErrorCodes.InsuranceCompany.EmptyName);
        }

        private static CreateInsuranceCompanyCommand CreateTestCommand()
        {
            return new CreateInsuranceCompanyCommand(new ViewModels.InsuranceCompanies.CreateInsuranceCompanyViewModel(
                Guid.NewGuid(),
                "Test",
                Domain.Enums.InsuranceType.Health,
                null,
                null,
                null,
                null,
                null,
                false,
                false,
                null,
                0,
                0,
                0,
                ["Test"],
                null
            ));
        }
    }
}
