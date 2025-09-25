using MediatR;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Commands.Appointments.CreateAppointment
{
    public sealed class CreateAppointmentCommandHandler : CommandHandlerBase, IRequestHandler<CreateAppointmentCommand>
    {
        private readonly IAppointmentRepository _appointmentRepository;

        public CreateAppointmentCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IAppointmentRepository appointmentRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _appointmentRepository = appointmentRepository;
        }

        public async Task Handle(CreateAppointmentCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var result = await _appointmentRepository.InsertAsync<Appointment, Guid>(new Appointment(
                request.NewAppointment.Id,
                Generate(),
                request.NewAppointment.PatientId,
                request.NewAppointment.DoctorId,
                request.NewAppointment.HospitalId,
                request.NewAppointment.DepartmentId,
                request.NewAppointment.AppointmentTypeId,
                request.NewAppointment.ScheduledDate,
                request.NewAppointment.ScheduledTime,
                request.NewAppointment.ScheduledEndTime,
                request.NewAppointment.ActualStartTime,
                request.NewAppointment.ActualEndTime,
                request.NewAppointment.DurationMinutes,
                request.NewAppointment.ChiefComplaint,
                request.NewAppointment.Symptoms,
                request.NewAppointment.ReasonForVisit,
                request.NewAppointment.ReferralReason,
                request.NewAppointment.ReferringDoctorId,
                request.NewAppointment.PreAppointmentNotes,
                request.NewAppointment.PostAppointmentNotes,
                request.NewAppointment.Diagnosis,
                request.NewAppointment.TreatmentPlan,
                request.NewAppointment.PrescriptionsGiven,
                request.NewAppointment.InvestigationsOrdered,
                request.NewAppointment.FollowUpDate,
                request.NewAppointment.FollowUpInstructions,
                request.NewAppointment.PaymentMethod,
                request.NewAppointment.RoomNumber,
                request.NewAppointment.QueueNumber,
                request.NewAppointment.EstimatedWaitTime,
                request.NewAppointment.PatientSatisfactionRating,
                null,
                null,
                null,
                null,
                null,
                request.UserId
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
        }

        /// <summary>
        /// Generate appointment number based on current time.
        /// Format: APP-YYYYMMDD-HHMMSS-fff-RND
        /// Ví dụ: APP-20250923-182530-123-57
        /// </summary>
        public static string Generate()
        {
            var now = TimeZoneHelper.GetLocalTimeNow();

            return $"APP-{now:yyyyMMdd-HHmmss}";
        }
    }
}
