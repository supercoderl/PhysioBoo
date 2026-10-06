using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Surgeries.UpdateRoomStatus
{
    public sealed class UpdateRoomStatusCommandValidation : AbstractValidator<UpdateRoomStatusCommand>
    {
        public UpdateRoomStatusCommandValidation()
        {
            RuleFor(c => c.RoomId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Surgery.EmptyRoomId).WithMessage("Room id may not be empty.");

            RuleFor(c => c.Input.Status)
                .Must(v => Enum.TryParse(v, true, out OperatingRoomStatus _))
                .WithErrorCode(DomainErrorCodes.Surgery.InvalidStatus).WithMessage("Status is not a valid operating room status.");
        }
    }
}
