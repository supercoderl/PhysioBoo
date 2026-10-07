namespace PhysioBoo.Application.Commands.Users.RemoveUserRole
{
    public sealed class RemoveUserRoleCommand : CommandBase, IRequest
    {
        private static readonly RemoveUserRoleCommandValidation s_validation = new();

        public Guid UserId { get; }
        public Guid RoleId { get; }

        public RemoveUserRoleCommand(Guid userId, Guid roleId) : base(Guid.NewGuid())
        {
            UserId = userId;
            RoleId = roleId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
