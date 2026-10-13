
using PhysioBoo.Domain.Errors;

using PhysioBoo.Domain.Interfaces.Repositories;

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

        public async Task Handle(UpdateHospitalGroupCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Operation.HospitalGroup? hospitalGroup = await _hospitalGroupRepository.GetByIdAsync(request.Id);

            if (hospitalGroup == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Hospital group with Id {request.Id} not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            string? code = string.IsNullOrWhiteSpace(request.HospitalGroup.Code) ? null : request.HospitalGroup.Code.Trim();

            if (code != null && await _hospitalGroupRepository.ExistsAsync(hg => hg.Code == code && hg.Id != request.Id, ct))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Code '{code}' is already used by another hospital group.",
                    DomainErrorCodes.HospitalGroup.CodeAlreadyExists
                ));

                return;
            }

            hospitalGroup.SetName(request.HospitalGroup.Name);
            hospitalGroup.SetCode(code);
            hospitalGroup.SetContactPerson(request.HospitalGroup.ContactPerson);
            hospitalGroup.SetLocation(
                request.HospitalGroup.CountryId,
                request.HospitalGroup.CityId,
                request.HospitalGroup.DistrictId,
                request.HospitalGroup.WardId
            );
            hospitalGroup.SetDescription(request.HospitalGroup.Description);
            hospitalGroup.SetHeadquartersAddress(request.HospitalGroup.HeadquartersAddress);
            hospitalGroup.SetWebsite(request.HospitalGroup.Website);
            hospitalGroup.SetPhone(request.HospitalGroup.Phone);
            hospitalGroup.SetEmail(request.HospitalGroup.Email);
            hospitalGroup.SetLogoUrl(request.HospitalGroup.LogoUrl);
            hospitalGroup.SetEstablishedDate(request.HospitalGroup.EstablishedDate);
            hospitalGroup.SetLicenseNumber(request.HospitalGroup.LicenseNumber);
            hospitalGroup.SetAccreditationDetails(string.IsNullOrWhiteSpace(request.HospitalGroup.AccreditationDetails) ? null : request.HospitalGroup.AccreditationDetails);
            hospitalGroup.SetUpdatedAt(TimeZoneHelper.GetLocalTimeNow());
            hospitalGroup.SetUpdatedBy(_user.GetUserId());

            await _hospitalGroupRepository.UpdateTrackedAsync(hospitalGroup, ct);
        }
    }
}
