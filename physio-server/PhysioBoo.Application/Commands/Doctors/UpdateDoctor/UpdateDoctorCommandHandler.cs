using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Commands.Doctors.UpdateDoctor
{
    public sealed class UpdateDoctorCommandHandler : CommandHandlerBase, IRequestHandler<UpdateDoctorCommand>
    {
        private readonly IDoctorRepository _doctorRepository;

        public UpdateDoctorCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IDoctorRepository doctorRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _doctorRepository = doctorRepository;
        }

        public async Task Handle(UpdateDoctorCommand request, CancellationToken ct)
        {
            if (!request.IsValid())
                return;

            Domain.Entities.MedicalStaff.Doctor? doctor = await _doctorRepository.GetByIdAsync(request.Id);

            if (doctor == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Doctor with Id {request.Id} not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            doctor.SetBio(request.Doctor.Bio);
            doctor.SetAbout(request.Doctor.About);
            doctor.SetArchivements(request.Doctor.Archivements);
            doctor.SetResearchInterests(request.Doctor.ResearchInterests);
            doctor.SetLanguagesSpoken(request.Doctor.LanguagesSpoken);
            doctor.SetPublicationsCount(request.Doctor.PublicationsCount);
            doctor.SetConferencePresentations(request.Doctor.ConferencePresentations);
            doctor.SetYearsOfExperience(request.Doctor.YearsOfExperience);
            doctor.SetYearsOfPractice(request.Doctor.YearsOfPractice);
            doctor.SetConsultationFeeMin(request.Doctor.ConsultationFeeMin);
            doctor.SetConsultationFeeMax(request.Doctor.ConsultationFeeMax);
            doctor.SetFollowUpFee(request.Doctor.FollowUpFee);
            doctor.SetEmergencyConsultationFee(request.Doctor.EmergencyConsultationFee);
            doctor.SetHomeVisitFee(request.Doctor.HomeVisitFee);
            doctor.SetVideoConsultationFee(request.Doctor.VideoConsultationFee);
            doctor.SetConsultationDuration(request.Doctor.ConsultationDuration);
            doctor.SetBufferTime(request.Doctor.BufferTime);
            doctor.SetAdvanceBookingDays(request.Doctor.AdvanceBookingDays);
            doctor.SetCancellationPolicy(request.Doctor.CancellationPolicy);
            doctor.SetIsAvailableOnline(request.Doctor.IsAvailableOnline);
            doctor.SetIsAvailableHomeVisit(request.Doctor.IsAvailableHomeVisit);
            doctor.SetIsAvailableEmergency(request.Doctor.IsAvailableEmergency);
            doctor.SetBankAccountDetails(request.Doctor.BankAccountDetails);
            doctor.SetPanNumber(request.Doctor.PanNumber);
            doctor.SetGstin(request.Doctor.Gstin);
            if (request.Doctor.EmploymentStatus.HasValue)
            {
                doctor.SetEmploymentStatus(request.Doctor.EmploymentStatus.Value);
            }
            doctor.SetUpdatedAt(TimeZoneHelper.GetLocalTimeNow());

            await _doctorRepository.UpdateTrackedAsync(doctor, ct);
        }
    }
}