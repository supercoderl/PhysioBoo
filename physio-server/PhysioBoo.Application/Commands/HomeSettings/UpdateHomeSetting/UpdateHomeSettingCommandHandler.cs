using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.HomeSettings.UpdateHomeSetting
{
    public sealed class UpdateHomeSettingCommandHandler : CommandHandlerBase, IRequestHandler<UpdateHomeSettingCommand>
    {
        private readonly IHomeSettingRepository _homeSettingRepository;
        private readonly IUser _user;

        public UpdateHomeSettingCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IHomeSettingRepository homeSettingRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _homeSettingRepository = homeSettingRepository;
            _user = user;
        }

        public async Task Handle(UpdateHomeSettingCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            HomeSetting? setting = await _homeSettingRepository.GetByTenantIdAsync(_user.GetTenantId(), cancellationToken);

            if (setting == null)
            {
                setting = new HomeSetting(
                    Guid.NewGuid(),
                    _user.GetTenantId(),
                    request.HomeSetting.HospitalName,
                    request.HomeSetting.TagLine,
                    request.HomeSetting.WelcomeMessage,
                    request.HomeSetting.ContactPhone,
                    request.HomeSetting.ContactEmail,
                    request.HomeSetting.Address,
                    request.HomeSetting.ShowEmergencyBanner
                );

                setting.SetCreatedBy(_user.GetUserId());
                SharedKernel.Results.DbResult<Guid> result = await _homeSettingRepository.InsertAsync<HomeSetting, Guid>(setting);

                if (!result.Success)
                {
                    await NotifyAsync(
                        request.MessageType,
                        "Failed to create home setting.",
                        ErrorCodes.CommitFailed
                    );
                }
            }
            else
            {
                setting.SetHospitalName(request.HomeSetting.HospitalName);
                setting.SetTagLine(request.HomeSetting.TagLine);
                setting.SetWelcomeMessage(request.HomeSetting.WelcomeMessage);
                setting.SetContactPhone(request.HomeSetting.ContactPhone);
                setting.SetContactEmail(request.HomeSetting.ContactEmail);
                setting.SetAddress(request.HomeSetting.Address);
                setting.SetShowEmergencyBanner(request.HomeSetting.ShowEmergencyBanner);
                setting.SetUpdatedBy(_user.GetUserId());
                setting.SetUpdatedAt(TimeZoneHelper.GetLocalTimeNow());

                await _homeSettingRepository.UpdateTrackedAsync(setting);
            }
        }
    }
}