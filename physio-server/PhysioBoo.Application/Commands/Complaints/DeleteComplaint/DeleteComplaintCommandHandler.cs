using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Complaints.DeleteComplaint
{
    public sealed class DeleteComplaintCommandHandler : CommandHandlerBase, IRequestHandler<DeleteComplaintCommand>
    {
        private readonly IComplaintRepository _complaintRepository;

        public DeleteComplaintCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IComplaintRepository complaintRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _complaintRepository = complaintRepository;
        }

        public async Task Handle(DeleteComplaintCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Complaint? complaint = await _complaintRepository.GetByIdAsync(request.Id, ct: cancellationToken);
            if (complaint == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Complaint with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            _complaintRepository.SoftDeleteSingle(complaint, request.IsHard, cancellationToken);

            await CommitAsync();
        }
    }
}
