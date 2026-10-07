namespace PhysioBoo.Application.Commands.Users.AddUserRole
{
    public sealed class AddUserRoleCommand : CommandBase, IRequest
    {
        private static readonly AddUserRoleCommandValidation s_validation = new();

        public Guid UserId { get; }
        public Guid RoleId { get; }

        public AddUserRoleCommand(Guid userId, Guid roleId) : base(Guid.NewGuid())
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
