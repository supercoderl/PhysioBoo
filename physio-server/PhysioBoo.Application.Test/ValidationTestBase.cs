using FluentValidation;
using PhysioBoo.SharedKernel.Commands;
using Shouldly;

namespace PhysioBoo.Application.Test
{
    public class ValidationTestBase<TCommand, TValidation> where TCommand : CommandBase where TValidation : AbstractValidator<TCommand>
    {
        private readonly TValidation _validator;

        protected ValidationTestBase(TValidation validator)
        {
            _validator = validator;
        }

        protected void ShouldBeValid(TCommand command)
        {
            FluentValidation.Results.ValidationResult result = _validator.Validate(command);
            result.IsValid.ShouldBeTrue();
            result.Errors.ShouldBeEmpty();
        }

        protected void ShouldHaveSingleError(TCommand command, string expectedCode)
        {
            FluentValidation.Results.ValidationResult result = _validator.Validate(command);

            result.IsValid.ShouldBeFalse();
            result.Errors.Count.ShouldBe(1);
            result.Errors.First().ErrorCode.ShouldBe(expectedCode);
        }

        protected void ShouldHaveSingleError(TCommand command, string expectedCode, string expectedMessage)
        {
            FluentValidation.Results.ValidationResult result = _validator.Validate(command);

            result.IsValid.ShouldBeFalse();
            result.Errors.Count.ShouldBe(1);
            result.Errors.First().ErrorCode.ShouldBe(expectedCode);
            result.Errors.First().ErrorMessage.ShouldBe(expectedMessage);
        }

        protected void ShouldHaveSingleErrors(TCommand command, params KeyValuePair<string, string>[] expectedErrors)
        {
            FluentValidation.Results.ValidationResult result = _validator.Validate(command);

            result.IsValid.ShouldBeFalse();
            result.Errors.Count.ShouldBe(expectedErrors.Length);

            foreach (KeyValuePair<string, string> error in expectedErrors)
            {
                result.Errors.Count(validation => validation.ErrorCode == error.Key && validation.ErrorMessage == error.Value).ShouldBe(1);
            }
        }

        protected void ShouldHaveExpectedErrors(TCommand command, params KeyValuePair<string, string>[] expectedErrors)
        {
            FluentValidation.Results.ValidationResult result = _validator.Validate(command);

            result.IsValid.ShouldBeFalse();
            result.Errors.Count.ShouldBe(expectedErrors.Length);

            foreach (KeyValuePair<string, string> error in expectedErrors)
            {
                result.Errors
                    .Count(validation => validation.ErrorCode == error.Key && validation.ErrorMessage == error.Value)
                    .ShouldBe(1);
            }
        }

        protected void ShouldHaveExpectedErrors(TCommand command, params string[] expectedErrors)
        {
            FluentValidation.Results.ValidationResult result = _validator.Validate(command);

            result.IsValid.ShouldBeFalse();
            result.Errors.Count.ShouldBe(expectedErrors.Length);

            foreach (string error in expectedErrors)
            {
                result.Errors.Count(validation => validation.ErrorCode == error).ShouldBe(1);
            }
        }
    }
}
