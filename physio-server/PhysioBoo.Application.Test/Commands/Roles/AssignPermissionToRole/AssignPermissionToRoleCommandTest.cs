using NSubstitute;
using PhysioBoo.Application.Commands.Roles.AssignPermissionToRole;
using PhysioBoo.Application.ViewModels.Roles;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;
using Xunit;

namespace PhysioBoo.Application.Test.Commands.Roles.AssignPermissionToRole
{
    public sealed class AssignPermissionToRoleCommandValidationTest : ValidationTestBase<AssignPermissionToRoleCommand, AssignPermissionToRoleCommandValidation>
    {
        public AssignPermissionToRoleCommandValidationTest() : base(new AssignPermissionToRoleCommandValidation())
        {
        }

        [Fact]
        public void Should_Be_Valid_When_Role_Id_Is_Set()
        {
            ShouldBeValid(new AssignPermissionToRoleCommand(
                new PermissionForAssigningViewModel(Guid.NewGuid(), new Dictionary<string, bool> { ["iam:user:read"] = true })));
        }

        [Fact]
        public void Should_Fail_When_Role_Id_Is_Empty()
        {
            ShouldHaveSingleError(
                new AssignPermissionToRoleCommand(new PermissionForAssigningViewModel(Guid.Empty, new Dictionary<string, bool>())),
                DomainErrorCodes.Role.EmptyId);
        }
    }

    public sealed class AssignPermissionToRoleCommandHandlerTest : CommandHandlerFixtureBase
    {
        private readonly IRolePermissionRepository _repository = Substitute.For<IRolePermissionRepository>();
        private readonly IRoleRepository _roles = Substitute.For<IRoleRepository>();

        [Fact]
        public async Task Should_Not_Touch_Permissions_When_The_Role_Does_Not_Exist()
        {
            AssignPermissionToRoleCommandHandler handler = new(Bus, UnitOfWork, NotificationHandler, _repository, _roles);

            await handler.Handle(new AssignPermissionToRoleCommand(
                new PermissionForAssigningViewModel(Guid.NewGuid(), new Dictionary<string, bool> { ["iam:user:read"] = true })), default);

            await _repository.DidNotReceive().AssignPermissionsAsync(Arg.Any<Guid>(), Arg.Any<IReadOnlyDictionary<string, bool>>(), Arg.Any<CancellationToken>());
            VerifyAnyDomainNotification();
        }

        [Fact]
        public async Task Should_Pass_Requested_Permissions_To_The_Repository()
        {
            AssignPermissionToRoleCommandHandler handler = new(Bus, UnitOfWork, NotificationHandler, _repository, _roles);
            Guid roleId = Guid.NewGuid();
            _roles.GetByIdAsync(roleId, Arg.Any<string>(), Arg.Any<CancellationToken>())
                .Returns(new PhysioBoo.Domain.Entities.Core.Role(roleId, "R", "R", null, null, null));
            Dictionary<string, bool> permissions = new() { ["iam:user:read"] = true, ["iam:user:delete"] = false };

            await handler.Handle(new AssignPermissionToRoleCommand(new PermissionForAssigningViewModel(roleId, permissions)), default);

            await _repository.Received(1).AssignPermissionsAsync(roleId, permissions, Arg.Any<CancellationToken>());
        }
    }
}
