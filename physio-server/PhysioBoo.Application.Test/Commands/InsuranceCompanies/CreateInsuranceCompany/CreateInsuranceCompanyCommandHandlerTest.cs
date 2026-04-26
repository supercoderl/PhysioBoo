using NSubstitute;
using PhysioBoo.Application.Commands.InsuranceCompanies.CreateInsuranceCompany;
using PhysioBoo.Domain.Entities.Support;
using Xunit;

namespace PhysioBoo.Application.Test.Commands.InsuranceCompanies.CreateInsuranceCompany
{
    public sealed class CreateInsuranceCompanyCommandHandlerTest
    {
        private readonly CreateInsuranceCompanyCommandTestFixture _fixture = new();

        [Fact]
        public async Task Should_Create_InsuranceCompany()
        {
            _fixture.SetupInsertSuccess();

            CreateInsuranceCompanyCommand command = new CreateInsuranceCompanyCommand(new ViewModels.InsuranceCompanies.CreateInsuranceCompanyViewModel(
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

            await _fixture.CommandHandler.Handle(command, default);
            _fixture.VerifyNoDomainNotification().VerifyNoCommit();
        }

        [Fact]
        public async Task Should_Raise_Notification_When_Insert_Fails()
        {
            _fixture.SetupInsertFailure();

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

            await _fixture.CommandHandler.Handle(command, default);
            _fixture.VerifyAnyDomainNotification().VerifyNoCommit();
        }

        [Fact]
        public async Task Should_Raise_Notification_When_Command_Is_Invalid()
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

            await _fixture.CommandHandler.Handle(command, default);

            _fixture.VerifyAnyDomainNotification();
            await _fixture.InsuranceCompanyRepository.DidNotReceive().InsertAsync<InsuranceCompany, Guid>(Arg.Any<InsuranceCompany>());
        }
    }
}
