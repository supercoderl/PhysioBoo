using MediatR;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.PrintTemplates.DeletePrintTemplate
{
    public sealed class DeletePrintTemplateCommand : CommandBase, IRequest
    {
        private static readonly DeletePrintTemplateCommandValidation s_validation = new();

        public Guid Id { get; }
        public bool IsHard { get; }

        public DeletePrintTemplateCommand(
            Guid id,
            bool isHard = false
        ) : base(Guid.NewGuid())
        {
            Id = id;
            IsHard = isHard;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
