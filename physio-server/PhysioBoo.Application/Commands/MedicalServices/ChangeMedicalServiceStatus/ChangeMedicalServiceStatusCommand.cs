using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.Commands.MedicalServices.ChangeMedicalServiceStatus
{
    public sealed class ChangeMedicalServiceStatusCommand : CommandBase, IRequest
    {
        private static readonly ChangeMedicalServiceStatusCommandValidation s_validation = new();

        public List<Guid> Ids { get; }
        public ServiceStatus TargetStatus { get; }

        public ChangeMedicalServiceStatusCommand(List<Guid> ids, ServiceStatus targetStatus) : base(Guid.NewGuid())
        {
            Ids = ids;
            TargetStatus = targetStatus;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
