using PhysioBoo.Application.ViewModels.Radiology;

namespace PhysioBoo.Application.Commands.Radiology.ReassignImagingTechnician
{
    public sealed class ReassignImagingTechnicianCommand : CommandBase, IRequest
    {
        private static readonly ReassignImagingTechnicianCommandValidation s_validation = new();

        public Guid Id { get; }
        public ReassignTechnicianViewModel Body { get; }

        public ReassignImagingTechnicianCommand(Guid id, ReassignTechnicianViewModel body) : base(Guid.NewGuid())
        {
            Id = id;
            Body = body;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
