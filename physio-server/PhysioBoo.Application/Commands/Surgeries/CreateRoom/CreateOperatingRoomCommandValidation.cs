using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Surgeries.CreateRoom
{
    public sealed class CreateOperatingRoomCommandValidation : AbstractValidator<CreateOperatingRoomCommand>
    {
        public CreateOperatingRoomCommandValidation()
        {
            RuleFor(c => c.NewId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Surgery.EmptyId).WithMessage("Id may not be empty.");

            RuleFor(c => c.NewRoom.RoomNumber)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Surgery.EmptyRoomNumber).WithMessage("Room number is required.")
                .MaximumLength(50).WithErrorCode(DomainErrorCodes.Surgery.TextExceedsMaxLength).WithMessage("Room number may not exceed 50 characters.");

            RuleFor(c => c.NewRoom.RoomType)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Surgery.EmptyName).WithMessage("Room type is required.")
                .MaximumLength(100).WithErrorCode(DomainErrorCodes.Surgery.TextExceedsMaxLength).WithMessage("Room type may not exceed 100 characters.");
        }
    }
}
