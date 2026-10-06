using PhysioBoo.Application.ViewModels.Surgeries;

namespace PhysioBoo.Application.Commands.Surgeries.AssignTeamMember
{
    public sealed class AssignTeamMemberCommand : CommandBase, IRequest
    {
        private static readonly AssignTeamMemberCommandValidation s_validation = new();

        public Guid SurgeryId { get; }
        public Guid MemberId { get; }
        public AssignTeamMemberViewModel Input { get; }

        public SurgicalTeamMemberViewModel? Result { get; set; }

        public AssignTeamMemberCommand(Guid surgeryId, Guid memberId, AssignTeamMemberViewModel input) : base(Guid.NewGuid())
        {
            SurgeryId = surgeryId;
            MemberId = memberId;
            Input = input;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
