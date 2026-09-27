
using PhysioBoo.Domain.Errors;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace PhysioBoo.Application.Extensions.Validation
{
    public static class CustomValidator
    {
        public static IRuleBuilderOptions<T, string> StringMustBeBase64<T>(this IRuleBuilder<T, string> ruleBuilder)
        {
            return ruleBuilder.Must(x => IsBase64String(x));
        }

        private static bool IsBase64String(string base64)
        {
            base64 = base64.Trim();
            return base64.Length % 4 == 0 && new Regex("^[a-zA-Z0-9\\+/]*={0,3}$").IsMatch(base64);
        }

        public static IRuleBuilder<T, string> Password<T>(
            this IRuleBuilder<T, string> ruleBuilder,
            int minLength = 8,
            int maxLength = 50)
        {
            IRuleBuilderOptions<T, string> options = ruleBuilder
                .NotEmpty().WithErrorCode(DomainErrorCodes.User.EmptyPassword)
                .MinimumLength(minLength).WithErrorCode(DomainErrorCodes.User.ShortPassword)
                .MaximumLength(maxLength).WithErrorCode(DomainErrorCodes.User.LongPassword)
                .Matches("[A-Z]").WithErrorCode(DomainErrorCodes.User.UppercaseLetterPassword)
                .Matches("[a-z]").WithErrorCode(DomainErrorCodes.User.LowercaseLetterPassword)
                .Matches("[0-9]").WithErrorCode(DomainErrorCodes.User.NumberPassword)
                .Matches("[^a-zA-Z0-9]").WithErrorCode(DomainErrorCodes.User.SpecialCharPassword);
            return options;
        }

        private static readonly Regex s_phone = new(@"^\+?[0-9][0-9\s\-().]{5,19}$", RegexOptions.Compiled);

        public static IRuleBuilderOptions<T, string> PhoneNumber<T>(this IRuleBuilder<T, string> ruleBuilder)
        {
            return ruleBuilder.Matches(s_phone);
        }

        public static IRuleBuilderOptions<T, string?> MaxLen<T>(this IRuleBuilder<T, string?> ruleBuilder, int max, string field)
        {
            return ruleBuilder
                .MaximumLength(max)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage($"{field} may not be longer than {max} characters.");
        }

        public static IRuleBuilderOptions<T, string?> OptionalEmail<T>(this IRuleBuilder<T, string?> ruleBuilder, string field)
        {
            return ruleBuilder
                .Must(v => string.IsNullOrWhiteSpace(v) || new EmailAddressAttribute().IsValid(v))
                .WithErrorCode(DomainErrorCodes.Validation.InvalidEmail)
                .WithMessage($"{field} is not a valid email address.");
        }

        public static IRuleBuilderOptions<T, string?> OptionalPhone<T>(this IRuleBuilder<T, string?> ruleBuilder, string field)
        {
            return ruleBuilder
                .Must(v => string.IsNullOrWhiteSpace(v) || s_phone.IsMatch(v))
                .WithErrorCode(DomainErrorCodes.Validation.InvalidPhone)
                .WithMessage($"{field} is not a valid phone number.");
        }

        public static IRuleBuilderOptions<T, string?> OptionalUrl<T>(this IRuleBuilder<T, string?> ruleBuilder, string field)
        {
            return ruleBuilder
                .Must(v => string.IsNullOrWhiteSpace(v)
                    || (Uri.TryCreate(v, UriKind.Absolute, out var uri) && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps)))
                .WithErrorCode(DomainErrorCodes.Validation.InvalidUrl)
                .WithMessage($"{field} is not a valid URL.");
        }

        public static IRuleBuilderOptions<T, decimal> NotNegative<T>(this IRuleBuilder<T, decimal> ruleBuilder, string field)
        {
            return ruleBuilder
                .GreaterThanOrEqualTo(0)
                .WithErrorCode(DomainErrorCodes.Validation.OutOfRange)
                .WithMessage($"{field} may not be negative.");
        }

        public static IRuleBuilderOptions<T, decimal?> NotNegative<T>(this IRuleBuilder<T, decimal?> ruleBuilder, string field)
        {
            return ruleBuilder
                .GreaterThanOrEqualTo(0)
                .WithErrorCode(DomainErrorCodes.Validation.OutOfRange)
                .WithMessage($"{field} may not be negative.");
        }

        public static IRuleBuilderOptions<T, int> NotNegative<T>(this IRuleBuilder<T, int> ruleBuilder, string field)
        {
            return ruleBuilder
                .GreaterThanOrEqualTo(0)
                .WithErrorCode(DomainErrorCodes.Validation.OutOfRange)
                .WithMessage($"{field} may not be negative.");
        }

        public static IRuleBuilder<T, decimal> GeographicCoordinate<T>(
            this IRuleBuilder<T, decimal> ruleBuilder,
            decimal min, decimal max
        )
        {
            return ruleBuilder
                .InclusiveBetween(-90, 90)
                .WithMessage($"Coordinate must be between {min} and {max} degrees.")
                .WithErrorCode(DomainErrorCodes.Address.InvalidGeographicCoordinate
            );
        }
    }
}
