using MediatR;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Shared.Events.Hospitals;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Commands.Hospitals.CreateHospital
{
    public sealed class CreateHospitalCommandHandler : CommandHandlerBase, IRequestHandler<CreateHospitalCommand>
    {
        private readonly IHospitalRepository _hospitalRepository;

        public CreateHospitalCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IHospitalRepository hospitalRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _hospitalRepository = hospitalRepository;
        }

        public async Task Handle(CreateHospitalCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var result = await _hospitalRepository.InsertAsync<Hospital, Guid>(new Hospital(
                request.NewHospital.Id,
                request.NewHospital.HospitalGroupId,
                request.NewHospital.Name,
                Generate(),
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

            await Bus.RaiseEventAsync(new HospitalCreatedEvent(result.Id));
        }

        /// <summary>
        /// Create hospital code base on current time.
        /// Format: HOS-YYYYMMDD-HHMMSS
        /// Ví dụ: HOS-20250923-174523
        /// </summary>
        private string Generate()
        {
            var now = TimeZoneHelper.GetLocalTimeNow();
            return $"HOS-{now:yyyyMMdd-HHmmss}";
        }
    }
}
