using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Users.UpdateMyAccount
{
    public sealed class UpdateMyAccountCommandValidation : AbstractValidator<UpdateMyAccountCommand>
    {
        public UpdateMyAccountCommandValidation()
        {
            RuleFor(c => c.Account.FirstName)
                .NotEmpty().When(c => c.Account.FirstName != null).WithErrorCode(DomainErrorCodes.Validation.Required).WithMessage("First name may not be empty.")
                .MaximumLength(100).WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength).WithMessage("First name may not exceed 100 characters.");

            RuleFor(c => c.Account.LastName)
                .NotEmpty().When(c => c.Account.LastName != null).WithErrorCode(DomainErrorCodes.Validation.Required).WithMessage("Last name may not be empty.")
                .MaximumLength(100).WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength).WithMessage("Last name may not exceed 100 characters.");

            RuleFor(c => c.Account.MiddleName)
                .MaximumLength(100).WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength).WithMessage("Middle name may not exceed 100 characters.");

            RuleFor(c => c.Account.Phone)
                .NotEmpty().When(c => c.Account.Phone != null).WithErrorCode(DomainErrorCodes.Validation.Required).WithMessage("Phone may not be empty.")
                .MaximumLength(20).WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength).WithMessage("Phone may not exceed 20 characters.");

            RuleFor(c => c.Account.AlternatePhone)
                .MaximumLength(20).WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength).WithMessage("Alternate phone may not exceed 20 characters.");

            RuleFor(c => c.Account.DateOfBirth)
                .Must(d => d == null || d <= DateOnly.FromDateTime(DateTime.Today)).WithErrorCode(DomainErrorCodes.Validation.OutOfRange).WithMessage("Date of birth can't be in the future.");

            RuleFor(c => c.Account.Gender).Must(BeEnum<Gender>).WithErrorCode(DomainErrorCodes.Validation.InvalidEnum).WithMessage("Gender is invalid.");
            RuleFor(c => c.Account.MaritalStatus).Must(BeEnum<MaritalStatus>).WithErrorCode(DomainErrorCodes.Validation.InvalidEnum).WithMessage("Marital status is invalid.");
            RuleFor(c => c.Account.BloodGroup).Must(BeEnum<BloodGroup>).WithErrorCode(DomainErrorCodes.Validation.InvalidEnum).WithMessage("Blood group is invalid.");
            RuleFor(c => c.Account.PreferredCommunication).Must(BeEnum<PreferredCommunication>).WithErrorCode(DomainErrorCodes.Validation.InvalidEnum).WithMessage("Preferred communication is invalid.");

            foreach (var (field, max) in new (System.Linq.Expressions.Expression<Func<UpdateMyAccountCommand, string?>> Field, int Max)[]
            {
                (c => c.Account.Nationality, 100),
                (c => c.Account.IdentificationType, 50),
                (c => c.Account.IdentificationNumber, 50),
                (c => c.Account.EmergencyContactName, 150),
                (c => c.Account.EmergencyContactPhone, 20),
                (c => c.Account.EmergencyContactRelationship, 50),
            })
            {
                RuleFor(field).MaximumLength(max).WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength).WithMessage($"{{PropertyName}} may not exceed {max} characters.");
            }
        }

        private static bool BeEnum<TEnum>(string? value) where TEnum : struct, Enum =>
            string.IsNullOrEmpty(value) || (Enum.TryParse(value, true, out TEnum parsed) && Enum.IsDefined(parsed));
    }
}
