using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.LabTests.UpdateLabTest
{
    public sealed class UpdateLabTestCommandValidation : AbstractValidator<UpdateLabTestCommand>
    {
        public UpdateLabTestCommandValidation()
        {
            RuleForId();
            RuleForTestName();
            RuleForCategoryId();
            RuleForSampleInfo();
            RuleForTiming();
            RuleForPricing();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.LabTest.EmptyId)
                .WithMessage("Id may not be empty.");
        }

        public void RuleForTestName()
        {
            RuleFor(cmd => cmd.LabTest.TestName)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.LabTest.EmptyTestName)
                .WithMessage("TestName may not be empty.")
                .MaximumLength(255)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("TestName may not be longer than 255 characters.");
        }

        public void RuleForCategoryId()
        {
            RuleFor(cmd => cmd.LabTest.CategoryId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.LabTest.EmptyCategoryId)
                .WithMessage("CategoryId may not be empty.");
        }

        public void RuleForSampleInfo()
        {
            RuleFor(cmd => cmd.LabTest.SampleType).MaxLen(100, "Sample type");
            RuleFor(cmd => cmd.LabTest.SampleVolume).MaxLen(50, "Sample volume");
            RuleFor(cmd => cmd.LabTest.UnitOfMeasurement).MaxLen(50, "Unit of measurement");
            RuleFor(cmd => cmd.LabTest.Methodology).MaxLen(255, "Methodology");
        }

        public void RuleForTiming()
        {
            RuleFor(cmd => cmd.LabTest.FastingHours).NotNegative("Fasting hours");
            RuleFor(cmd => cmd.LabTest.ReportingTimeHours).NotNegative("Reporting time");
            RuleFor(cmd => cmd.LabTest.UrgentReportingTimeHours).NotNegative("Urgent reporting time");
        }

        public void RuleForPricing()
        {
            RuleFor(cmd => cmd.LabTest.Cost).NotNegative("Cost");
            RuleFor(cmd => cmd.LabTest.UrgentCost).NotNegative("Urgent cost");
            RuleFor(cmd => cmd.LabTest.HomeCollectionCharge).NotNegative("Home collection charge");
        }
    }
}
