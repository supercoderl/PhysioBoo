namespace PhysioBoo.Application.Commands.Invites.CreateInvite
{
    public sealed class CreateInviteCommandValidation : AbstractValidator<CreateInviteCommand>
    {
        public CreateInviteCommandValidation()
        {
            // TODO: Add your validation rules here
            // Example:
            // RuleFor(x => x.NewUser.Name)
            //     .NotEmpty()
            //     .WithMessage("Name is required");
        }
    }
}