using PhysioBoo.Application.ViewModels.Surgeries;

namespace PhysioBoo.Application.Commands.Surgeries.CreateRoom
{
    public sealed class CreateOperatingRoomCommand : CommandBase, IRequest
    {
        private static readonly CreateOperatingRoomCommandValidation s_validation = new();

        public Guid NewId { get; }
        public CreateOperatingRoomViewModel NewRoom { get; }

        public OperatingRoomViewModel? Result { get; set; }

        public CreateOperatingRoomCommand(Guid newId, CreateOperatingRoomViewModel newRoom) : base(Guid.NewGuid())
        {
            NewId = newId;
            NewRoom = newRoom;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
