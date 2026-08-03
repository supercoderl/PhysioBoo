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
        private readonly IUser _user;

        // TODO: Add your dependencies via constructor
        public CreateDoctorLeaveCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IDoctorLeaveRepository doctorLeaveRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _doctorLeaveRepository = doctorLeaveRepository;
            _user = user;
        }

        public async Task Handle(CreateDoctorLeaveCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            DoctorLeave newDoctorLeave = new DoctorLeave(
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
            );

            newDoctorLeave.SetTenantId(_user.GetTenantId());
            newDoctorLeave.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _doctorLeaveRepository.InsertAsync<DoctorLeave, Guid>(newDoctorLeave);

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