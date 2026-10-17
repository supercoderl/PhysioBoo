using PhysioBoo.Domain.Errors;
using System.Text.RegularExpressions;

namespace PhysioBoo.Application.Commands.Public.SendContactMessage
{
    // Same rules and wording as the form on the contact page, enforced again server-side.
    public sealed class SendPublicContactMessageCommandValidation : AbstractValidator<SendPublicContactMessageCommand>
    {
        /// <summary>The lead's notes hold 2,000 characters; this leaves room for the topic and clinic lines.</summary>
        public const int MessageMaxLength = 1500;

        private static readonly Regex s_phoneChars = new(@"^\+?[\d\s().-]+$", RegexOptions.Compiled);
        private static readonly Regex s_email = new(@"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$", RegexOptions.Compiled);

        public SendPublicContactMessageCommandValidation()
        {
            RuleFor(c => c.Message.FullName)
                .Must(v => (v ?? "").Trim().Length >= 2).WithErrorCode(DomainErrorCodes.Lead.EmptyName).WithMessage("Enter your full name.")
                .MaximumLength(120).WithErrorCode(DomainErrorCodes.Lead.NameExceedsMaxLength).WithMessage("Name may not exceed 120 characters.");

            RuleFor(c => c.Message.Phone)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Lead.EmptyPhone).WithMessage("Enter a phone number so we can reply.")
                .Must(BeAPhoneNumber).WithErrorCode(ErrorCodes.InvalidValue).WithMessage("Enter a valid phone number, for example 0901 234 567.")
                .When(c => !string.IsNullOrWhiteSpace(c.Message.Phone), ApplyConditionTo.CurrentValidator);

            RuleFor(c => c.Message.Email)
                .Must(v => s_email.IsMatch(v!.Trim()) && v.Trim().Length <= 254)
                .WithErrorCode(DomainErrorCodes.Lead.InvalidEmail).WithMessage("Enter a valid email address, or leave it blank.")
                .When(c => !string.IsNullOrWhiteSpace(c.Message.Email));

            RuleFor(c => c.Message.Topic)
                .Must(v => PublicContactTopics.Labels.ContainsKey(v!))
                .WithErrorCode(ErrorCodes.InvalidValue).WithMessage("Choose a topic from the list.")
                .When(c => !string.IsNullOrEmpty(c.Message.Topic));

            RuleFor(c => c.Message.Message)
                .Must(v => !string.IsNullOrWhiteSpace(v)).WithErrorCode(ErrorCodes.InvalidValue).WithMessage("Enter your message.")
                .MaximumLength(MessageMaxLength).WithErrorCode(ErrorCodes.InvalidValue).WithMessage("Keep your message under 1,500 characters.");

            RuleFor(c => c.Message.Consent)
                .Equal(true).WithErrorCode(ErrorCodes.InvalidValue).WithMessage("Tick the box to agree to the Privacy Policy so we can reply.");
        }

        private static bool BeAPhoneNumber(string? phone)
        {
            string value = (phone ?? "").Trim();
            int digits = value.Count(char.IsDigit);
            return value.Length <= 32 && s_phoneChars.IsMatch(value) && digits >= 9 && digits <= 15;
        }
    }
}
