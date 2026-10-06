using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Scrumboard.UpdateList
{
    public sealed class UpdateScrumListCommandHandler : CommandHandlerBase, IRequestHandler<UpdateScrumListCommand>
    {
        private readonly IScrumListRepository _listRepository;
        private readonly IUser _user;

        public UpdateScrumListCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IScrumListRepository listRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _listRepository = listRepository;
            _user = user;
        }

        public async Task Handle(UpdateScrumListCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            string title = request.Input.Title.Trim();
            Guid? userId = _user.GetUserId();
            DateTime? updatedAt = TimeZoneHelper.GetLocalTimeNow();

            int updated = await _listRepository.BatchUpdateMultipleAsync(
                l => l.Id == request.Id,
                s => s
                    .SetProperty(l => l.Title, title)
                    .SetProperty(l => l.UpdatedBy, userId)
                    .SetProperty(l => l.UpdatedAt, updatedAt),
                cancellationToken
            );

            if (updated == 0)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"List with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
            }
        }
    }
}
