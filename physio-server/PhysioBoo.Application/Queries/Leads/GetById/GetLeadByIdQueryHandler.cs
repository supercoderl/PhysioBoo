using PhysioBoo.Application.ViewModels.Leads;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Leads.GetById
{
    public sealed class GetLeadByIdQueryHandler : IRequestHandler<GetLeadByIdQuery, LeadViewModel?>
    {
        private readonly ILeadRepository _leadRepository;
        private readonly IMediatorHandler _bus;

        public GetLeadByIdQueryHandler(
            ILeadRepository leadRepository,
            IMediatorHandler bus
        )
        {
            _leadRepository = leadRepository;
            _bus = bus;
        }

        public async Task<LeadViewModel?> Handle(GetLeadByIdQuery request, CancellationToken cancellationToken)
        {
            Domain.Entities.Crm.Lead? lead = await _leadRepository.GetByIdAsync(request.Id, ct: cancellationToken);
            if (lead == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetLeadByIdQuery),
                    $"Lead with id {request.Id} doesn't exists.",
                    ErrorCodes.ObjectNotFound
                ));
                return null;
            }

            return LeadViewModel.FromEntity(lead);
        }
    }
}
