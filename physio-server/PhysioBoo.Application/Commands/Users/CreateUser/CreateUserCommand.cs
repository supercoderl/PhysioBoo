using MediatR;
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Users.CreateUser
{
    public sealed class CreateUserCommand : CommandBase, IRequest
    {
        private static readonly CreateUserCommandValidation s_validation = new();

        public CreateUserViewModel NewUser { get; }
        public Guid NewId { get; }
        public Guid? AssignedBy { get; }

        public CreateUserCommand(CreateUserViewModel newUser, Guid newId, Guid? assignedBy = null) : base(Guid.NewGuid())
        {
            NewUser = newUser;
            NewId = newId;
            AssignedBy = assignedBy;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
