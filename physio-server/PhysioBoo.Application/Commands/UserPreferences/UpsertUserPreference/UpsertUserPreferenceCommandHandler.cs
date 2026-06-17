using MediatR;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.SharedKernel.Utils;
using System.Text.Json;

namespace PhysioBoo.Application.Commands.UserPreferences.UpsertUserPreference
{
    public sealed class UpsertUserPreferenceCommandHandler : CommandHandlerBase, IRequestHandler<UpsertUserPreferenceCommand>
    {
        private readonly IUserPreferenceRepository _userPreferenceRepository;
        private readonly IUser _user;

        public UpsertUserPreferenceCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IUserPreferenceRepository userPreferenceRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _userPreferenceRepository = userPreferenceRepository;
            _user = user;
        }

        public async Task Handle(UpsertUserPreferenceCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            string json = JsonSerializer.Serialize(request.UserPreferences.Preferences);

            await _userPreferenceRepository.BulkUpsertUserPreferenceAsync(_user.GetUserId(), _user.GetTenantId(), json, TimeZoneHelper.GetLocalTimeNow(), _user.GetUserId());
        }
    }
}