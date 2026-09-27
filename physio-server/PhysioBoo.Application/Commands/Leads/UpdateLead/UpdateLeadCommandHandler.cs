using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Leads.UpdateLead
{
    public sealed class UpdateLeadCommandHandler : CommandHandlerBase, IRequestHandler<UpdateLeadCommand>
    {
        private readonly ILeadRepository _leadRepository;
        private readonly IUser _user;

        public UpdateLeadCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ILeadRepository leadRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _leadRepository = leadRepository;
            _user = user;
        }

        public async Task Handle(UpdateLeadCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Crm.Lead? lead = await _leadRepository.GetByIdAsync(request.Id, ct: cancellationToken);
            if (lead == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Lead with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            lead.SetName(request.Lead.Name);
            lead.SetPhone(request.Lead.Phone);
            lead.SetEmail(request.Lead.Email);
            lead.SetService(request.Lead.Service);
            lead.SetSource(request.Lead.Source);
            lead.SetStatus(Enum.Parse<LeadStatus>(request.Lead.Status, true));
            lead.SetPriority(Enum.Parse<LeadPriority>(request.Lead.Priority, true));
            lead.SetAssignedTo(string.IsNullOrWhiteSpace(request.Lead.AssignedTo) ? null : request.Lead.AssignedTo);
            lead.SetNotes(string.IsNullOrWhiteSpace(request.Lead.Notes) ? null : request.Lead.Notes);

            lead.SetUpdatedBy(_user.GetUserId());

            await _leadRepository.UpdateTrackedAsync(lead, cancellationToken);
        }
    }
}