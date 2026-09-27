using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Leads.DeleteLead
{
    public sealed class DeleteLeadCommandHandler : CommandHandlerBase, IRequestHandler<DeleteLeadCommand>
    {
        private readonly ILeadRepository _leadRepository;

        public DeleteLeadCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ILeadRepository leadRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _leadRepository = leadRepository;
        }

        public async Task Handle(DeleteLeadCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Lead? lead = await _leadRepository.GetByIdAsync(request.Id, ct: cancellationToken);

            if (lead == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Lead with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            _leadRepository.SoftDeleteSingle(lead, false, cancellationToken);

            await CommitAsync();
        }
    }
}