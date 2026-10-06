using PhysioBoo.Application.ViewModels.Surgeries;

namespace PhysioBoo.Application.Commands.Surgeries.UpdateRoomStatus
{
    public sealed class UpdateRoomStatusCommand : CommandBase, IRequest
    {
        private static readonly UpdateRoomStatusCommandValidation s_validation = new();

        public Guid RoomId { get; }
        public UpdateRoomStatusViewModel Input { get; }

        public UpdateRoomStatusCommand(Guid roomId, UpdateRoomStatusViewModel input) : base(Guid.NewGuid())
        {
            RoomId = roomId;
            Input = input;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
