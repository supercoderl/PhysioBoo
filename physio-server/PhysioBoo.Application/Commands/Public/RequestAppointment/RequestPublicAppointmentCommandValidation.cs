using PhysioBoo.Domain.Errors;
using System.Text.RegularExpressions;

namespace PhysioBoo.Application.Commands.Public.RequestAppointment
{
    // Same rules and wording as the request form on the doctor page, enforced again server-side.
    public sealed class RequestPublicAppointmentCommandValidation : AbstractValidator<RequestPublicAppointmentCommand>
    {
        private static readonly Regex s_phoneChars = new(@"^\+?[\d\s().-]+$", RegexOptions.Compiled);
        private static readonly Regex s_email = new(@"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$", RegexOptions.Compiled);

        public RequestPublicAppointmentCommandValidation()
        {
            RuleFor(c => c.Request.DoctorId)
                .NotEmpty().WithErrorCode(ErrorCodes.ObjectNotFound).WithMessage("Choose a doctor.");

            RuleFor(c => c.Request.FullName)
                .Must(v => (v ?? "").Trim().Length >= 2).WithErrorCode(DomainErrorCodes.Lead.EmptyName).WithMessage("Enter your full name.")
                .MaximumLength(120).WithErrorCode(DomainErrorCodes.Lead.NameExceedsMaxLength).WithMessage("Name may not exceed 120 characters.");

            RuleFor(c => c.Request.Phone)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Lead.EmptyPhone).WithMessage("Enter a phone number so the clinic can call you back.")
                .Must(BeAPhoneNumber).WithErrorCode(ErrorCodes.InvalidValue).WithMessage("Enter a valid phone number, for example 0901 234 567.")
                .When(c => !string.IsNullOrWhiteSpace(c.Request.Phone), ApplyConditionTo.CurrentValidator);

            RuleFor(c => c.Request.Email)
                .Must(v => s_email.IsMatch(v!.Trim()) && v.Trim().Length <= 254)
                .WithErrorCode(DomainErrorCodes.Lead.InvalidEmail).WithMessage("Enter a valid email, or leave this blank.")
                .When(c => !string.IsNullOrWhiteSpace(c.Request.Email));

            RuleFor(c => c.Request.Service)
                .MaximumLength(200).WithErrorCode(ErrorCodes.InvalidValue).WithMessage("Choose a service.")
                .When(c => c.Request.Service != null);
        }

        private static bool BeAPhoneNumber(string? phone)
        {
            string value = (phone ?? "").Trim();
            int digits = value.Count(char.IsDigit);
            return value.Length <= 32 && s_phoneChars.IsMatch(value) && digits >= 9 && digits <= 15;
        }
    }
}
