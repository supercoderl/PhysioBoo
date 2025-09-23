using MediatR;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Shared.Events.HospitalGroups;

namespace PhysioBoo.Application.Commands.HospitalGroups.CreateHospitalGroup
{
    public sealed class CreateHospitalGroupCommandHandler : CommandHandlerBase, IRequestHandler<CreateHospitalGroupCommand>
    {
        private readonly IHospitalGroupRepository _hospitalGroupRepository;

        public CreateHospitalGroupCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IHospitalGroupRepository hospitalGroupRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _hospitalGroupRepository = hospitalGroupRepository;
        }

        public async Task Handle(CreateHospitalGroupCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var result = await _hospitalGroupRepository.InsertAsync<HospitalGroup, Guid>(new HospitalGroup(
                request.NewHospitalGroup.Id,
                request.NewHospitalGroup.Name,
                request.NewHospitalGroup.Description,
                request.NewHospitalGroup.HeadquartersAddress,
                request.NewHospitalGroup.Website,
                request.NewHospitalGroup.Phone,
                request.NewHospitalGroup.Email,
                request.NewHospitalGroup.LogoUrl,
                request.NewHospitalGroup.EstablishedDate,
                request.NewHospitalGroup.LicenseNumber,
                request.NewHospitalGroup.AccreditationDetails
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

            await Bus.RaiseEventAsync(new HospitalGroupCreatedEvent(result.Id));
        }
    }
}
