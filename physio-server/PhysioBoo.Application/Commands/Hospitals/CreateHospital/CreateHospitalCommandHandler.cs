using MediatR;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Shared.Events.Hospitals;

namespace PhysioBoo.Application.Commands.Hospitals.CreateHospital
{
    public sealed class CreateHospitalCommandHandler : CommandHandlerBase, IRequestHandler<CreateHospitalCommand>
    {
        private readonly IHospitalRepository _hospitalRepository;
        private readonly IUser _user;
        private readonly ISys_SequenceTrackerRepository _sys_SequenceTrackerRepository;

        public CreateHospitalCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IHospitalRepository hospitalRepository,
            IUser user,
            ISys_SequenceTrackerRepository sys_SequenceTrackerRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _hospitalRepository = hospitalRepository;
            _user = user;
            _sys_SequenceTrackerRepository = sys_SequenceTrackerRepository;
        }

        public async Task Handle(CreateHospitalCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            string newCode = await _sys_SequenceTrackerRepository.GenerateNextCodeAsync(nameof(Hospital), cancellationToken);

            Hospital newHospital = new Hospital(
                request.NewId,
                request.NewHospital.Name,
                newCode,
                request.NewHospital.HospitalType,
                request.NewHospital.EmergencyCapacity,
                request.NewHospital.OperationTheaters,
                request.NewHospital.Address,
                request.NewHospital.City,
                request.NewHospital.StateProvince,
                request.NewHospital.PostalCode,
                request.NewHospital.Country,
                request.NewHospital.Phone,
                request.NewHospital.Fax,
                request.NewHospital.Email,
                request.NewHospital.Website,
                request.NewHospital.EmergencyPhone,
                request.NewHospital.AmbulancePhone,
                request.NewHospital.Latitude,
                request.NewHospital.Longtitude,
                request.NewHospital.EstablishedDate,
                request.NewHospital.LicenseNumber,
                request.NewHospital.LicenseExpiry,
                request.NewHospital.AccreditationBody,
                request.NewHospital.AccreditationExpiry,
                request.NewHospital.InsuranceAccepted,
                request.NewHospital.LanguagesSupported,
                request.NewHospital.Facilities,
                request.NewHospital.OperatingHours,
                request.NewHospital.LogoUrl,
                request.NewHospital.Images,
                request.NewHospital.Description,
                request.NewHospital.MissionStatement,
                request.NewHospital.VisionStatement
            );

            newHospital.SetTenantId(request.NewHospital.HospitalGroupId);
            newHospital.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _hospitalRepository.InsertAsync<Hospital, Guid>(newHospital);

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));

                return;
            }

            await Bus.RaiseEventAsync(new HospitalCreatedEvent(result.Id));
        }
    }
}
