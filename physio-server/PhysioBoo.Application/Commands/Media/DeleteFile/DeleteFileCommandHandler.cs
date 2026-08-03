using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using MediatR;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Media.DeleteFile
{
    public sealed class DeleteFileCommandHandler : CommandHandlerBase, IRequestHandler<DeleteFileCommand>
    {
        private readonly ISys_MediaFileRepository _sys_MediaFileRepository;
        private readonly Cloudinary _cloudinary;

        public DeleteFileCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ISys_MediaFileRepository sys_MediaFileRepository,
            Cloudinary cloudinary
        ) : base(bus, unitOfWork, notifications)
        {
            _sys_MediaFileRepository = sys_MediaFileRepository;
            _cloudinary = cloudinary;
        }

        public async Task Handle(DeleteFileCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.System.Sys_MediaFile? mediaFile = await _sys_MediaFileRepository.GetByUrlAsync(request.Url);

            if (mediaFile != null)
            {
                DeletionParams deletionParams = new DeletionParams(mediaFile.PublicId)
                {
                    ResourceType = ResourceType.Image
                };

                DeletionResult result = await _cloudinary.DestroyAsync(deletionParams);

                if (result.Result == "ok" || result.Result == "not found")
                {
                    _sys_MediaFileRepository.SoftDeleteSingle(
                        mediaFile,
                        true,
                        ct
                    );

                    await CommitAsync();
                }
            }
        }
    }
}
