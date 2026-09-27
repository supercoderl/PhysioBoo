using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.LabTests.CreateLabTest
{
    public sealed class CreateLabTestCommandValidation : AbstractValidator<CreateLabTestCommand>
    {
        public CreateLabTestCommandValidation()
        {
            RuleForTestName();
            RuleForCategoryId();
            RuleForSampleInfo();
            RuleForTiming();
            RuleForPricing();
        }

        public void RuleForTestName()
        {
            RuleFor(cmd => cmd.NewLabTest.TestName)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.LabTest.EmptyTestName)
                .WithMessage("TestName may not be empty.")
                .MaximumLength(255)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("TestName may not be longer than 255 characters.");
        }

        public void RuleForCategoryId()
        {
            RuleFor(cmd => cmd.NewLabTest.CategoryId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.LabTest.EmptyCategoryId)
                .WithMessage("CategoryId may not be empty.");
        }

        public void RuleForSampleInfo()
        {
            RuleFor(cmd => cmd.NewLabTest.SampleType).MaxLen(100, "Sample type");
            RuleFor(cmd => cmd.NewLabTest.SampleVolume).MaxLen(50, "Sample volume");
            RuleFor(cmd => cmd.NewLabTest.UnitOfMeasurement).MaxLen(50, "Unit of measurement");
            RuleFor(cmd => cmd.NewLabTest.Methodology).MaxLen(255, "Methodology");
        }

        public void RuleForTiming()
        {
            RuleFor(cmd => cmd.NewLabTest.FastingHours).NotNegative("Fasting hours");
            RuleFor(cmd => cmd.NewLabTest.ReportingTimeHours).NotNegative("Reporting time");
            RuleFor(cmd => cmd.NewLabTest.UrgentReportingTimeHours).NotNegative("Urgent reporting time");
        }

        public void RuleForPricing()
        {
            RuleFor(cmd => cmd.NewLabTest.Cost).NotNegative("Cost");
            RuleFor(cmd => cmd.NewLabTest.UrgentCost).NotNegative("Urgent cost");
            RuleFor(cmd => cmd.NewLabTest.HomeCollectionCharge).NotNegative("Home collection charge");
        }
    }
}
