using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Scrumboard.UpdateBoard
{
    public sealed class UpdateScrumBoardCommandHandler : CommandHandlerBase, IRequestHandler<UpdateScrumBoardCommand>
    {
        private readonly IScrumBoardRepository _boardRepository;
        private readonly IUser _user;

        public UpdateScrumBoardCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IScrumBoardRepository boardRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _boardRepository = boardRepository;
            _user = user;
        }

        public async Task Handle(UpdateScrumBoardCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            string title = request.Input.Title.Trim();
            string? description = string.IsNullOrWhiteSpace(request.Input.Description) ? null : request.Input.Description.Trim();
            Guid? userId = _user.GetUserId();
            DateTime? updatedAt = TimeZoneHelper.GetLocalTimeNow();

            int updated = await _boardRepository.BatchUpdateMultipleAsync(
                b => b.Id == request.Id,
                s => s
                    .SetProperty(b => b.Title, title)
                    .SetProperty(b => b.Description, description)
                    .SetProperty(b => b.UpdatedBy, userId)
                    .SetProperty(b => b.UpdatedAt, updatedAt),
                cancellationToken
            );

            if (updated == 0)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Board with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
            }
        }
    }
}
