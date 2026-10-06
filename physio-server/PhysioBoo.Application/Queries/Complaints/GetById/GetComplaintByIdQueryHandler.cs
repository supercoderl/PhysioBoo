using PhysioBoo.Application.ViewModels.Complaints;
using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Complaints.GetById
{
    public sealed class GetComplaintByIdQueryHandler : IRequestHandler<GetComplaintByIdQuery, ComplaintViewModel?>
    {
        private readonly IComplaintRepository _complaintRepository;
        private readonly IMediatorHandler _bus;

        public GetComplaintByIdQueryHandler(
            IComplaintRepository complaintRepository,
            IMediatorHandler bus
        )
        {
            _complaintRepository = complaintRepository;
            _bus = bus;
        }

        public async Task<ComplaintViewModel?> Handle(GetComplaintByIdQuery request, CancellationToken cancellationToken)
        {
            Complaint? complaint = await _complaintRepository.GetByIdAsync(request.Id, ct: cancellationToken);
            if (complaint == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetComplaintByIdQuery),
                    $"Complaint with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return null;
            }

            return ComplaintViewModel.FromEntity(complaint);
        }
    }
}
