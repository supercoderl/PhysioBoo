using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Surgeries;
using PhysioBoo.Domain.Entities.Theatre;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Surgeries.AssignTeamMember
{
    public sealed class AssignTeamMemberCommandHandler : CommandHandlerBase, IRequestHandler<AssignTeamMemberCommand>
    {
        private readonly ISurgeryCaseRepository _surgeryRepository;
        private readonly ISurgeryTeamMemberRepository _teamRepository;
        private readonly IUserRepository _userRepository;
        private readonly IUser _user;

        public AssignTeamMemberCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ISurgeryCaseRepository surgeryRepository,
            ISurgeryTeamMemberRepository teamRepository,
            IUserRepository userRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _surgeryRepository = surgeryRepository;
            _teamRepository = teamRepository;
            _userRepository = userRepository;
            _user = user;
        }

        public async Task Handle(AssignTeamMemberCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            if (!await _teamRepository.ExistsAsync(m => m.Id == request.MemberId && m.SurgeryCaseId == request.SurgeryId, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Team member with id {request.MemberId} doesn't exist on this surgery.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            if (!await _userRepository.ExistsAsync(request.Input.StaffId, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Staff member with id {request.Input.StaffId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            if (!await _surgeryRepository.ExistsAsync(
                c => c.Id == request.SurgeryId && c.Status != SurgeryStatus.Cancelled && c.Status != SurgeryStatus.Discharged,
                cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "This surgery is closed and its team can no longer change.",
                    DomainErrorCodes.Surgery.NotEditable
                ));
                return;
            }

            SurgicalTeamRole role = Enum.Parse<SurgicalTeamRole>(request.Input.Role, true);
            Guid staffId = request.Input.StaffId;
            Guid? userId = _user.GetUserId();
            DateTime? updatedAt = TimeZoneHelper.GetLocalTimeNow();

            await _teamRepository.BatchUpdateMultipleAsync(
                m => m.Id == request.MemberId,
                s => s
                    .SetProperty(m => m.StaffUserId, staffId)
                    .SetProperty(m => m.Role, role)
                    .SetProperty(m => m.UpdatedBy, userId)
                    .SetProperty(m => m.UpdatedAt, updatedAt),
                cancellationToken
            );

            // Reload with the staff profile so the response carries the new name.
            SurgeryTeamMember? member = await _teamRepository
                .GetAllNoTracking(m => m.Id == request.MemberId, includeProperties: "StaffUser.Profile")
                .FirstOrDefaultAsync(cancellationToken);
            if (member != null) request.Result = SurgicalTeamMemberViewModel.FromEntity(member);
        }
    }
}
