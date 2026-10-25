using Microsoft.Extensions.Logging;
using PhysioBoo.Application.Interfaces;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Doctors.RemoveDoctorAvatar
{
    public sealed class RemoveDoctorAvatarCommandHandler : CommandHandlerBase, IRequestHandler<RemoveDoctorAvatarCommand>
    {
        private readonly IDoctorRepository _doctorRepository;
        private readonly IUserRepository _userRepository;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IUser _user;
        private readonly ILogger<RemoveDoctorAvatarCommandHandler> _logger;

        public RemoveDoctorAvatarCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IDoctorRepository doctorRepository,
            IUserRepository userRepository,
            ICloudinaryService cloudinaryService,
            IUser user,
            ILogger<RemoveDoctorAvatarCommandHandler> logger
        ) : base(bus, unitOfWork, notifications)
        {
            _doctorRepository = doctorRepository;
            _userRepository = userRepository;
            _cloudinaryService = cloudinaryService;
            _user = user;
            _logger = logger;
        }

        public async Task Handle(RemoveDoctorAvatarCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            // Same scope check and explicit update as the upload: queries are no-tracking by default.
            User? user = await _doctorRepository.ExistsAsync(request.DoctorId, ct)
                ? await _userRepository.GetByIdAsync(request.DoctorId, ct: ct)
                : null;
            if (user == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Doctor with id {request.DoctorId} doesn't exist.", ErrorCodes.ObjectNotFound));
                return;
            }

            string? previousUrl = user.ProfilePicture;
            if (string.IsNullOrEmpty(previousUrl)) return;

            user.SetProfilePicture(null);
            user.SetUpdatedBy(_user.GetUserId());
            user.SetUpdatedAt(TimeZoneHelper.GetLocalTimeNow());

            try
            {
                await _userRepository.UpdateTrackedAsync(user, ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Removing the avatar failed for doctor {DoctorId}", request.DoctorId);
                await NotifyAsync(new DomainNotification(request.MessageType, "Unexpected error while saving the data.", ErrorCodes.CommitFailed));
                return;
            }

            // Only files we stored are deleted, and only when no other user still points at them.
            string? publicId = DoctorAvatarStorage.TryGetOwnedPublicId(previousUrl);
            if (publicId == null) return;

            try
            {
                if (!await _userRepository.ExistsAsync(u => u.ProfilePicture == previousUrl && u.Id != user.Id, ct))
                {
                    await _cloudinaryService.DeleteImageAsync(publicId, ct);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not delete avatar image {PublicId}", publicId);
            }
        }
    }
}
