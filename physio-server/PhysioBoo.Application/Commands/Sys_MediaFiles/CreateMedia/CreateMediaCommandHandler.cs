using MassTransit;
using MediatR;
using PhysioBoo.Application.Interfaces;
using PhysioBoo.Domain.Entities.System;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Shared.Events.Cloudinaries;
using PhysioBoo.SharedKernel.Results;

namespace PhysioBoo.Application.Commands.Sys_Media.CreateMedia
{
    public sealed class CreateMediaCommandHandler : CommandHandlerBase, IRequestHandler<CreateMediaCommand>
    {
        private readonly ISys_MediaFileRepository _sys_MediaFileRepository;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IPublishEndpoint _publishEndpoint;

        public CreateMediaCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IPublishEndpoint publishEndpoint,
            ISys_MediaFileRepository sys_MediaFileRepository,
            ICloudinaryService cloudinaryService
        ) : base(bus, unitOfWork, notifications)
        {
            _sys_MediaFileRepository = sys_MediaFileRepository;
            _cloudinaryService = cloudinaryService;
            _publishEndpoint = publishEndpoint;
        }

        public async Task Handle(CreateMediaCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Sys_MediaFile media = new Sys_MediaFile(
                request.NewMedia.Id,
                request.NewMedia.PublicId,
                request.NewMedia.Url,
                request.NewMedia.RefType,
                request.NewMedia.RefId
            );

            media.SetIsTemporary(false);

            DbResult<Guid> result = await _sys_MediaFileRepository.InsertAsync<Sys_MediaFile, Guid>(media);

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));

                return;
            }

            await RemoveTagTemporaryAsync(request.NewMedia.PublicId);
        }

        private async Task RemoveTagTemporaryAsync(string publicId)
        {
            try
            {
                await _cloudinaryService.RemoveTagAsync(publicId, "temporary");
            }
            catch (Exception)
            {
                await _publishEndpoint.Publish(new TagMessageRemoveEvent
                {
                    PublicId = publicId,
                    Tag = "temporary"
                });
            }
        }
    }
}
