
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Transactions.HandleGatewayNotification
{
    public sealed class HandleGatewayNotificationCommandValidation : AbstractValidator<HandleGatewayNotificationCommand>
    {
        public HandleGatewayNotificationCommandValidation()
        {
            RuleForGatewayProvider();
            RuleForRawBody();
        }

        public void RuleForGatewayProvider()
        {
            RuleFor(cmd => cmd.GatewayProvider)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Transaction.EmptyGatewayProvider)
                .WithMessage("GatewayProvider may not be empty.");
        }

        public void RuleForRawBody()
        {
            RuleFor(cmd => cmd.Context.RawBody)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Transaction.MissingReference)
                .WithMessage("Notification body may not be empty.");
        }
    }
}
