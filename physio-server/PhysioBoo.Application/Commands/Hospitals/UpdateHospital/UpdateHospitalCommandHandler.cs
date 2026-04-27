using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Hospitals.UpdateHospital
{
    public sealed class UpdateHospitalCommandHandler : CommandHandlerBase, IRequestHandler<UpdateHospitalCommand>
    {
        private readonly IHospitalRepository _hospitalRepository;

        public UpdateHospitalCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IHospitalRepository hospitalRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _hospitalRepository = hospitalRepository;
        }

        public async Task Handle(UpdateHospitalCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Operation.Hospital? hospital = await _hospitalRepository.GetByIdAsync(request.Id);

            if (hospital == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Hospital with Id {request.Id} not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            hospital.SetName(request.Hospital.Name);
            hospital.SetHospitalType(request.Hospital.HospitalType);
            hospital.SetBedCapacity(request.Hospital.BedCapacity);
            hospital.SetIcuCapacity(request.Hospital.IcuCapacity);
            hospital.SetEmergencyCapacity(request.Hospital.EmergencyCapacity);
            hospital.SetOperationTheaters(request.Hospital.OperationTheaters);
            hospital.SetAddress(request.Hospital.Address);
            hospital.SetCity(request.Hospital.City);
            hospital.SetStateProvince(request.Hospital.StateProvince);
            hospital.SetPostalCode(request.Hospital.PostalCode);
            hospital.SetCountry(request.Hospital.Country);
            hospital.SetPhone(request.Hospital.Phone);
            hospital.SetFax(request.Hospital.Fax);
            hospital.SetEmail(request.Hospital.Email);
            hospital.SetWebsite(request.Hospital.Website);
            hospital.SetEmergencyPhone(request.Hospital.EmergencyPhone);
            hospital.SetAmbulancePhone(request.Hospital.AmbulancePhone);
            hospital.SetLatitude(request.Hospital.Latitude);
            hospital.SetLongtitude(request.Hospital.Longtitude);
            hospital.SetEstablishedDate(request.Hospital.EstablishedDate);
            hospital.SetLicenseNumber(request.Hospital.LicenseNumber);
            hospital.SetLicenseExpiry(request.Hospital.LicenseExpiry);
            hospital.SetAccreditationBody(request.Hospital.AccreditationBody);
            hospital.SetAccreditationExpiry(request.Hospital.AccreditationExpiry);
            hospital.SetInsuranceAccepted(request.Hospital.InsuranceAccepted);
            hospital.SetLanguagesSupported(request.Hospital.LanguagesSupported);
            hospital.SetFacilities(request.Hospital.Facilities);
            hospital.SetOperatingHours(request.Hospital.OperatingHours);
            hospital.SetIs24Hours(request.Hospital.Is24Hours);
            hospital.SetIsActive(request.Hospital.IsActive);
            hospital.SetLogoUrl(request.Hospital.LogoUrl);
            hospital.SetImages(request.Hospital.Images);
            hospital.SetDescription(request.Hospital.Description);
            hospital.SetMissionStatement(request.Hospital.MissionStatement);
            hospital.SetVisionStatement(request.Hospital.VisionStatement);

            await _hospitalRepository.UpdateTrackedAsync(hospital, cancellationToken);
        }
    }
}