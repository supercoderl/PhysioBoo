using PhysioBoo.Application.ViewModels.Scrumboard;
using PhysioBoo.Domain.Entities.Workspace;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Scrumboard.UpdateCard
{
    public sealed class UpdateScrumCardCommandHandler : CommandHandlerBase, IRequestHandler<UpdateScrumCardCommand>
    {
        private readonly IScrumCardRepository _cardRepository;
        private readonly IUser _user;

        public UpdateScrumCardCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IScrumCardRepository cardRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _cardRepository = cardRepository;
            _user = user;
        }

        public async Task Handle(UpdateScrumCardCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            ScrumCard? card = await _cardRepository.GetByIdAsync(request.Id, ct: cancellationToken);
            if (card == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Card with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            string title = request.Input.Title.Trim();
            string? description = string.IsNullOrWhiteSpace(request.Input.Description) ? null : request.Input.Description.Trim();
            DateTime? dueDate = request.Input.DueDate;
            Guid? userId = _user.GetUserId();
            DateTime? updatedAt = TimeZoneHelper.GetLocalTimeNow();

            // Position and column are not touched here: moving a card has its own endpoint.
            await _cardRepository.BatchUpdateMultipleAsync(
                c => c.Id == request.Id,
                s => s
                    .SetProperty(c => c.Title, title)
                    .SetProperty(c => c.Description, description)
                    .SetProperty(c => c.DueDate, dueDate)
                    .SetProperty(c => c.UpdatedBy, userId)
                    .SetProperty(c => c.UpdatedAt, updatedAt),
                cancellationToken
            );

            card.SetTitle(title);
            card.SetDescription(description);
            card.SetDueDate(dueDate);
            request.Result = ScrumCardViewModel.FromEntity(card);
        }
    }
}
