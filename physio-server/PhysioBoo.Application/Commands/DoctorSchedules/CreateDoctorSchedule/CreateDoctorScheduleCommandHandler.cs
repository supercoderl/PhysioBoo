using MediatR;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.DoctorSchedules.CreateDoctorSchedule
{
    public sealed class CreateDoctorScheduleCommandHandler : CommandHandlerBase, IRequestHandler<CreateDoctorScheduleCommand>
    {
        private readonly IDoctorScheduleRepository _doctorScheduleRepository;
        private readonly IUser _user;

        public CreateDoctorScheduleCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IDoctorScheduleRepository doctorScheduleRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _doctorScheduleRepository = doctorScheduleRepository;
            _user = user;
        }

        public async Task Handle(CreateDoctorScheduleCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            DoctorSchedule newDoctorSchedule = new DoctorSchedule(
                request.NewDoctorSchedule.Id,
                request.NewDoctorSchedule.DoctorId,
                request.NewDoctorSchedule.HospitalId,
                request.NewDoctorSchedule.DepartmentId,
                request.NewDoctorSchedule.DayOfWeek,
                request.NewDoctorSchedule.StartTime,
                request.NewDoctorSchedule.EndTime,
                request.NewDoctorSchedule.BreakStartTime,
                request.NewDoctorSchedule.BreakEndTime,
                request.NewDoctorSchedule.ScheduleType,
                request.NewDoctorSchedule.EffectiveTo,
                request.NewDoctorSchedule.ConsultationFee,
                request.NewDoctorSchedule.Notes
            );

            newDoctorSchedule.SetTenantId(_user.GetTenantId());
            newDoctorSchedule.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _doctorScheduleRepository.InsertAsync<DoctorSchedule, Guid>(newDoctorSchedule);

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