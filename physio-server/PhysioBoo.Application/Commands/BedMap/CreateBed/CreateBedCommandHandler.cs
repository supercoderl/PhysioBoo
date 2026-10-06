using PhysioBoo.Application.ViewModels.BedMap;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.BedMap.CreateBed
{
    public sealed class CreateBedCommandHandler : CommandHandlerBase, IRequestHandler<CreateBedCommand>
    {
        private readonly IBedRepository _bedRepository;
        private readonly IWardRepository _wardRepository;
        private readonly IUser _user;

        public CreateBedCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IBedRepository bedRepository,
            IWardRepository wardRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _bedRepository = bedRepository;
            _wardRepository = wardRepository;
            _user = user;
        }

        public async Task Handle(CreateBedCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Ward? ward = await _wardRepository.GetByIdAsync(request.NewBed.WardId, ct: cancellationToken);
            if (ward == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Ward with id {request.NewBed.WardId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            string number = request.NewBed.Number.Trim();
            if (await _bedRepository.ExistsAsync(b => b.WardId == request.NewBed.WardId && b.Number == number, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Bed {number} already exists in this ward.",
                    DomainErrorCodes.Bed.DuplicateNumber
                ));
                return;
            }

            BedTypeText.TryParse(request.NewBed.BedType, out BedType bedType);

            Bed newBed = new Bed(
                request.NewId,
                request.NewBed.WardId,
                number,
                string.IsNullOrWhiteSpace(request.NewBed.RoomNumber) ? null : request.NewBed.RoomNumber.Trim(),
                request.NewBed.Floor ?? ward.Floor,
                bedType,
                request.NewBed.IsolationRequired,
                string.IsNullOrWhiteSpace(request.NewBed.Notes) ? null : request.NewBed.Notes.Trim()
            );

            newBed.SetTenantId(_user.GetTenantId());
            newBed.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _bedRepository.InsertAsync<Bed, Guid>(newBed);
            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Failed to create bed: {result.Error}",
                    ErrorCodes.CommitFailed
                ));
            }
        }
    }
}
