
using PhysioBoo.Application.ViewModels.Payments;
using PhysioBoo.SharedKernel.Commands;
using System.Text.Json.Serialization;

namespace PhysioBoo.Application.Commands.Transactions.HandleGatewayNotification
{
    public sealed class HandleGatewayNotificationCommand : CommandBase, IRequest
    {
        private static readonly HandleGatewayNotificationCommandValidation s_validation = new();

        public string GatewayProvider { get; }
        public GatewayNotificationContext Context { get; }

        [JsonIgnore]
        public bool Handled { get; set; }

        public HandleGatewayNotificationCommand(string gatewayProvider, GatewayNotificationContext context) : base(Guid.NewGuid())
        {
            GatewayProvider = gatewayProvider;
            Context = context;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
