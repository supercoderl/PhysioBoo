using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Scrumboard;
using PhysioBoo.Domain.Entities.Workspace;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Scrumboard.CreateCard
{
    public sealed class CreateScrumCardCommandHandler : CommandHandlerBase, IRequestHandler<CreateScrumCardCommand>
    {
        private readonly IScrumListRepository _listRepository;
        private readonly IScrumCardRepository _cardRepository;
        private readonly IUser _user;

        public CreateScrumCardCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IScrumListRepository listRepository,
            IScrumCardRepository cardRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _listRepository = listRepository;
            _cardRepository = cardRepository;
            _user = user;
        }

        public async Task Handle(CreateScrumCardCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            ScrumList? list = await _listRepository.GetByIdAsync(request.ListId, ct: cancellationToken);
            if (list == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"List with id {request.ListId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            // New cards go to the bottom of the column.
            int? last = await _cardRepository
                .GetAllNoTracking(c => c.ListId == request.ListId)
                .MaxAsync(c => (int?)c.Position, cancellationToken);

            string? description = string.IsNullOrWhiteSpace(request.Input.Description) ? null : request.Input.Description.Trim();

            ScrumCard card = new ScrumCard(
                request.NewId,
                list.BoardId,
                list.Id,
                request.Input.Title.Trim(),
                description,
                request.Input.DueDate,
                (last ?? -1) + 1
            );
            card.SetTenantId(_user.GetTenantId());
            card.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> inserted = await _cardRepository.InsertAsync<ScrumCard, Guid>(card);
            if (!inserted.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Failed to create card: {inserted.Error}",
                    ErrorCodes.CommitFailed
                ));
                return;
            }

            request.Result = ScrumCardViewModel.FromEntity(card);
        }
    }
}
