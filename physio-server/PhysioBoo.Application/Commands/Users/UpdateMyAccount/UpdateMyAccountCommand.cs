using PhysioBoo.Application.ViewModels.Users;

namespace PhysioBoo.Application.Commands.Users.UpdateMyAccount
{
    public sealed class UpdateMyAccountCommand : CommandBase, IRequest
    {
        private static readonly UpdateMyAccountCommandValidation s_validation = new();

        public UpdateMyAccountViewModel Account { get; }

        public UpdateMyAccountCommand(UpdateMyAccountViewModel account) : base(Guid.NewGuid())
        {
            Account = account;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
