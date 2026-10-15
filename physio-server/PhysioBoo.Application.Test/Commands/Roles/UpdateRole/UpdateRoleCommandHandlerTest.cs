using NSubstitute;
using PhysioBoo.Application.Commands.Roles.UpdateRole;
using PhysioBoo.Application.ViewModels.Roles;
using PhysioBoo.Domain.Entities.Core;
using Xunit;

namespace PhysioBoo.Application.Test.Commands.Roles.UpdateRole
{
    public sealed class UpdateRoleCommandHandlerTest
    {
        private readonly UpdateRoleCommandTestFixture _fixture = new();

        [Fact]
        public async Task Should_Persist_Name_Code_Description_Color_And_Icon()
        {
            Role role = new Role(Guid.NewGuid(), "Old name", "old-code", null, "#111111", "old-icon");
            _fixture.SetupExistingRole(role);

            UpdateRoleCommand command = new UpdateRoleCommand(
                role.Id,
                new UpdateRoleViewModel("New name", "new-code", "New description", "#ffffff", "new-icon", false, true, false)
            );

            await _fixture.CommandHandler.Handle(command, default);

            Assert.Equal("New name", role.Name);
            Assert.Equal("new-code", role.Code);
            Assert.Equal("New description", role.Description);
            Assert.Equal("#ffffff", role.Color);
            Assert.Equal("new-icon", role.Icon);
            _fixture.VerifyNoDomainNotification();
        }

        [Fact]
        public async Task Should_Raise_Notification_When_Role_Does_Not_Exist()
        {
            UpdateRoleCommand command = new UpdateRoleCommand(
                Guid.NewGuid(),
                new UpdateRoleViewModel("Name", "code", null, null, null, false, true, false)
            );

            await _fixture.CommandHandler.Handle(command, default);

            _fixture.VerifyAnyDomainNotification();
        }
    }
}
