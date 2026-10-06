using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.BedMap.UpdateWard
{
    public sealed class UpdateWardCommandHandler : CommandHandlerBase, IRequestHandler<UpdateWardCommand>
    {
        private readonly IWardRepository _wardRepository;
        private readonly IDepartmentRepository _departmentRepository;
        private readonly IUser _user;

        public UpdateWardCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IWardRepository wardRepository,
            IDepartmentRepository departmentRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _wardRepository = wardRepository;
            _departmentRepository = departmentRepository;
            _user = user;
        }

        public async Task Handle(UpdateWardCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Inpatient.Ward? ward = await _wardRepository.GetByIdAsync(request.Id, ct: cancellationToken);
            if (ward == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Ward with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            string? code = string.IsNullOrWhiteSpace(request.Ward.Code) ? null : request.Ward.Code.Trim();

            if (request.Ward.DepartmentId.HasValue &&
                !await _departmentRepository.ExistsAsync(request.Ward.DepartmentId.Value, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Department with id {request.Ward.DepartmentId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            if (code != null && await _wardRepository.ExistsAsync(w => w.Code == code && w.Id != request.Id, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "A ward with this code already exists.",
                    DomainErrorCodes.Ward.DuplicateCode
                ));
                return;
            }

            ward.SetCode(code);
            ward.SetName(request.Ward.Name.Trim());
            ward.SetFloor(request.Ward.Floor);
            ward.SetDepartmentId(request.Ward.DepartmentId);
            ward.SetUpdatedBy(_user.GetUserId());

            await _wardRepository.UpdateTrackedAsync(ward, cancellationToken);
        }
    }
}
