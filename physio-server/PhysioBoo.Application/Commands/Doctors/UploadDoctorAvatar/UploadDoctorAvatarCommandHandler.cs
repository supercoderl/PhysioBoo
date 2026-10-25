using Microsoft.Extensions.Logging;
using PhysioBoo.Application.Interfaces;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Doctors.UploadDoctorAvatar
{
    public sealed class UploadDoctorAvatarCommandHandler : CommandHandlerBase, IRequestHandler<UploadDoctorAvatarCommand>
    {
        private readonly IDoctorRepository _doctorRepository;
        private readonly IUserRepository _userRepository;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IUser _user;
        private readonly ILogger<UploadDoctorAvatarCommandHandler> _logger;

        public UploadDoctorAvatarCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IDoctorRepository doctorRepository,
            IUserRepository userRepository,
            ICloudinaryService cloudinaryService,
            IUser user,
            ILogger<UploadDoctorAvatarCommandHandler> logger
        ) : base(bus, unitOfWork, notifications)
        {
            _doctorRepository = doctorRepository;
            _userRepository = userRepository;
            _cloudinaryService = cloudinaryService;
            _user = user;
            _logger = logger;
        }

        public async Task Handle(UploadDoctorAvatarCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            // The doctor's id is the user's id. The doctor check goes through the tenant query filter, so a doctor
            // of another tenant is "not found". Queries are no-tracking by default, hence the explicit update below.
            User? user = await _doctorRepository.ExistsAsync(request.DoctorId, ct)
                ? await _userRepository.GetByIdAsync(request.DoctorId, ct: ct)
                : null;
            if (user == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Doctor with id {request.DoctorId} doesn't exist.", ErrorCodes.ObjectNotFound));
                return;
            }

            await using Stream stream = request.File.OpenReadStream();

            string? imageType = await DoctorAvatarStorage.DetectImageTypeAsync(stream, ct);
            if (imageType == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, "Avatar must be a JPEG, PNG or WebP image.", DomainErrorCodes.Doctor.UnsupportedAvatarType));
                return;
            }
            stream.Position = 0;

            CloudinaryImageUpload upload;
            try
            {
                upload = await _cloudinaryService.UploadImageAsync(stream, DoctorAvatarStorage.Folder, ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Avatar upload failed for doctor {DoctorId}", request.DoctorId);
                await NotifyAsync(new DomainNotification(request.MessageType, "Avatar upload failed, please try again.", DomainErrorCodes.Doctor.AvatarUploadFailed));
                return;
            }

            string? previousUrl = user.ProfilePicture;

            user.SetProfilePicture(upload.Url);
            user.SetUpdatedBy(_user.GetUserId());
            user.SetUpdatedAt(TimeZoneHelper.GetLocalTimeNow());

            try
            {
                await _userRepository.UpdateTrackedAsync(user, ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Saving the avatar failed for doctor {DoctorId}", request.DoctorId);
                await NotifyAsync(new DomainNotification(request.MessageType, "Unexpected error while saving the data.", ErrorCodes.CommitFailed));
                // Nothing references the new file, so do not leave it orphaned in storage.
                await TryDeleteAsync(upload.PublicId, ct);
                return;
            }

            request.AvatarUrl = upload.Url;

            string? previousPublicId = DoctorAvatarStorage.TryGetOwnedPublicId(previousUrl);
            if (previousPublicId != null && !await _userRepository.ExistsAsync(u => u.ProfilePicture == previousUrl && u.Id != user.Id, ct))
            {
                await TryDeleteAsync(previousPublicId, ct);
            }
        }

        private async Task TryDeleteAsync(string publicId, CancellationToken ct)
        {
            try
            {
                await _cloudinaryService.DeleteImageAsync(publicId, ct);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not delete avatar image {PublicId}", publicId);
            }
        }
    }
}
