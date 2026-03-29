using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Commands.HospitalGroups.UpdateHospitalGroup
{
    public sealed class UpdateHospitalGroupCommandHandler : CommandHandlerBase, IRequestHandler<UpdateHospitalGroupCommand>
    {
        private readonly IHospitalGroupRepository _hospitalGroupRepository;
        private readonly IUser _user;

        public UpdateHospitalGroupCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IHospitalGroupRepository hospitalGroupRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _hospitalGroupRepository = hospitalGroupRepository;
            _user = user;
        }

        public async Task Handle(UpdateHospitalGroupCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Operation.HospitalGroup? hospitalGroup = await _hospitalGroupRepository.GetByIdAsync(request.HospitalGroup.Id);

            if (hospitalGroup == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Hospital group with Id {request.HospitalGroup.Id} not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            hospitalGroup.SetName(request.HospitalGroup.Name);
            hospitalGroup.SetDescription(request.HospitalGroup.Description);
            hospitalGroup.SetHeadquartersAddress(request.HospitalGroup.HeadquartersAddress);
            hospitalGroup.SetWebsite(request.HospitalGroup.Website);
            hospitalGroup.SetPhone(request.HospitalGroup.Phone);
            hospitalGroup.SetEmail(request.HospitalGroup.Email);
            hospitalGroup.SetLogoUrl(request.HospitalGroup.LogoUrl);
            hospitalGroup.SetEstablishedDate(request.HospitalGroup.EstablishedDate);
            hospitalGroup.SetLicenseNumber(request.HospitalGroup.LicenseNumber);
            hospitalGroup.SetUpdatedAt(TimeZoneHelper.GetLocalTimeNow());
            hospitalGroup.SetUpdatedBy(_user.GetUserId());

            await _hospitalGroupRepository.UpdateTrackedAsync(hospitalGroup, cancellationToken);
        }
    }
}
