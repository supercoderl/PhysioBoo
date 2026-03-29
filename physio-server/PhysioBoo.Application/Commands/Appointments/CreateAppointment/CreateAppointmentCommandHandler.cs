using MediatR;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Appointments.CreateAppointment
{
    public sealed class CreateAppointmentCommandHandler : CommandHandlerBase, IRequestHandler<CreateAppointmentCommand>
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IUser _user;
        private readonly ISys_SequenceTrackerRepository _sys_SequenceTrackerRepository;

        public CreateAppointmentCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IAppointmentRepository appointmentRepository,
            IUser user,
            ISys_SequenceTrackerRepository sys_SequenceTrackerRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _appointmentRepository = appointmentRepository;
            _user = user;
            _sys_SequenceTrackerRepository = sys_SequenceTrackerRepository;
        }

        public async Task Handle(CreateAppointmentCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            string newCode = await _sys_SequenceTrackerRepository.GenerateNextCodeAsync(nameof(Appointment), cancellationToken);

            Appointment newAppointment = new Appointment(
                request.NewAppointment.Id,
                newCode,
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
                null
            );

            newAppointment.SetTenantId(_user.GetTenantId());
            newAppointment.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _appointmentRepository.InsertAsync<Appointment, Guid>(newAppointment);

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
    }
}
