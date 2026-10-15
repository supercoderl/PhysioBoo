using NSubstitute;
using PhysioBoo.Application.Commands.Roles.UpdateRole;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Test.Commands.Roles.UpdateRole
{
    public sealed class UpdateRoleCommandTestFixture : CommandHandlerFixtureBase
    {
        public UpdateRoleCommandHandler CommandHandler { get; }
        public IRoleRepository RoleRepository { get; }

        public UpdateRoleCommandTestFixture()
        {
            RoleRepository = Substitute.For<IRoleRepository>();

            CommandHandler = new UpdateRoleCommandHandler(
                Bus,
                UnitOfWork,
                NotificationHandler,
                RoleRepository
            );
        }

        public void SetupExistingRole(Role role)
        {
            RoleRepository
                .GetByIdAsync(role.Id, Arg.Any<string>(), Arg.Any<CancellationToken>())
                .Returns(role);

            RoleRepository
                .UpdateTrackedAsync(role, Arg.Any<CancellationToken>())
                .Returns(1);
        }
    }
}
