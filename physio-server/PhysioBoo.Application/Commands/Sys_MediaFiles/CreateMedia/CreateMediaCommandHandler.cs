using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Sys_Media.CreateMedia
{
    public sealed class CreateMediaCommandHandler : CommandHandlerBase, IRequestHandler<CreateMediaCommand>
    {
        private readonly ISys_MediaFileRepository _sys_MediaFileRepository;

        public CreateMediaCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ISys_MediaFileRepository sys_MediaFileRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _sys_MediaFileRepository = sys_MediaFileRepository;
        }

        public async Task Handle(CreateMediaCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            SharedKernel.Results.DbResult<Guid> result = await _sys_MediaFileRepository.InsertAsync<Domain.Entities.System.Sys_MediaFile, Guid>(new Domain.Entities.System.Sys_MediaFile(
                request.NewMedia.Id,
                request.NewMedia.PublicId,
                request.NewMedia.Url,
                request.NewMedia.RefType,
                request.NewMedia.RefId
            ));

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));

                return;
            }
        }
    }
}
