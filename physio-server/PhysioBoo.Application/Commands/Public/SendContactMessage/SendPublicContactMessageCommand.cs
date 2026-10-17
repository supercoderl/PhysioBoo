using PhysioBoo.Application.ViewModels.Public;

namespace PhysioBoo.Application.Commands.Public.SendContactMessage
{
    /// <summary>
    /// An anonymous visitor sends a message from the public contact page.
    /// It becomes a CRM lead (source "Website") for the team to answer.
    /// </summary>
    public sealed class SendPublicContactMessageCommand : CommandBase, IRequest
    {
        private static readonly SendPublicContactMessageCommandValidation s_validation = new();

        public Guid NewId { get; }
        public Guid TenantId { get; }
        public PublicContactMessageViewModel Message { get; }

        public SendPublicContactMessageCommand(Guid newId, Guid tenantId, PublicContactMessageViewModel message) : base(Guid.NewGuid())
        {
            NewId = newId;
            TenantId = tenantId;
            Message = message;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
