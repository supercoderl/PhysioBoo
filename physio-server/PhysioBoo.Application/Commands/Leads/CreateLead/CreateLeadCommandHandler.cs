using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Leads.CreateLead
{
    public sealed class CreateLeadCommandHandler : CommandHandlerBase, IRequestHandler<CreateLeadCommand>
    {
        private readonly ILeadRepository _leadRepository;
        private readonly IUser _user;

        public CreateLeadCommandHandler(
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

        public async Task Handle(CreateLeadCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Lead newLead = new Lead(
                request.NewId,
                request.NewLead.Name,
                request.NewLead.Phone,
                request.NewLead.Email,
                request.NewLead.Service,
                request.NewLead.Source,
                Enum.Parse<LeadStatus>(request.NewLead.Status),
                Enum.Parse<LeadPriority>(request.NewLead.Priority),
                request.NewLead.AssignedTo,
                request.NewLead.Notes
            );

            newLead.SetTenantId(_user.GetTenantId());
            newLead.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _leadRepository.InsertAsync<Lead, Guid>(newLead);
            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));
            }
        }
    }
}