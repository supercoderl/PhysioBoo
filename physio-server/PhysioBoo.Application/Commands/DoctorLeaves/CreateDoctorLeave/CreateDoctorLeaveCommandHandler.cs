using MediatR;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.DoctorLeaves.CreateDoctorLeave
{
    public sealed class CreateDoctorLeaveCommandHandler : CommandHandlerBase, IRequestHandler<CreateDoctorLeaveCommand>
    {
        private readonly IDoctorLeaveRepository _doctorLeaveRepository;

        // TODO: Add your dependencies via constructor
        public CreateDoctorLeaveCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IDoctorLeaveRepository doctorLeaveRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _doctorLeaveRepository = doctorLeaveRepository;
        }

        public async Task Handle(CreateDoctorLeaveCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            SharedKernel.Results.DbResult<Guid> result = await _doctorLeaveRepository.InsertAsync<DoctorLeave, Guid>(new DoctorLeave(
                request.NewDoctorLeave.Id,
                request.NewDoctorLeave.DoctorId,
                request.NewDoctorLeave.LeaveType,
                request.NewDoctorLeave.StartDate,
                request.NewDoctorLeave.EndDate,
                request.NewDoctorLeave.StartTime,
                request.NewDoctorLeave.EndTime,
                request.NewDoctorLeave.TotalDays,
                request.NewDoctorLeave.Reason,
                request.NewDoctorLeave.ApprovedBy,
                request.NewDoctorLeave.ApprovedAt,
                request.NewDoctorLeave.SubstituteDoctorId,
                request.NewDoctorLeave.EmergencyContact,
                request.NewDoctorLeave.DocumentsUrl
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
    }
}