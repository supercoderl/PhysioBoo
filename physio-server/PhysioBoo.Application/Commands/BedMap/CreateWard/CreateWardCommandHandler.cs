using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.BedMap.CreateWard
{
    public sealed class CreateWardCommandHandler : CommandHandlerBase, IRequestHandler<CreateWardCommand>
    {
        private readonly IWardRepository _wardRepository;
        private readonly IDepartmentRepository _departmentRepository;
        private readonly IUser _user;

        public CreateWardCommandHandler(
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

        public async Task Handle(CreateWardCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            string? code = string.IsNullOrWhiteSpace(request.NewWard.Code) ? null : request.NewWard.Code.Trim();

            if (request.NewWard.DepartmentId.HasValue &&
                !await _departmentRepository.ExistsAsync(request.NewWard.DepartmentId.Value, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Department with id {request.NewWard.DepartmentId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            if (code != null && await _wardRepository.ExistsAsync(w => w.Code == code, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "A ward with this code already exists.",
                    DomainErrorCodes.Ward.DuplicateCode
                ));
                return;
            }

            Ward newWard = new Ward(
                request.NewId,
                code,
                request.NewWard.Name.Trim(),
                request.NewWard.Floor,
                request.NewWard.DepartmentId
            );

            newWard.SetTenantId(_user.GetTenantId());
            newWard.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _wardRepository.InsertAsync<Ward, Guid>(newWard);
            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Failed to create ward: {result.Error}",
                    ErrorCodes.CommitFailed
                ));
            }
        }
    }
}
