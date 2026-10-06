using PhysioBoo.Application.ViewModels.Complaints;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Complaints.GetAll
{
    public sealed class GetAllComplaintsQueryHandler : IRequestHandler<GetAllComplaintsQuery, PagedResult<ComplaintViewModel>>
    {
        private readonly IComplaintRepository _complaintRepository;
        private readonly ISortingExpressionProvider<ComplaintViewModel, Complaint> _sortingExpressionProvider;

        public GetAllComplaintsQueryHandler(
            IComplaintRepository complaintRepository,
            ISortingExpressionProvider<ComplaintViewModel, Complaint> sortingExpressionProvider
        )
        {
            _complaintRepository = complaintRepository;
            _sortingExpressionProvider = sortingExpressionProvider;
        }

        public async Task<PagedResult<ComplaintViewModel>> Handle(GetAllComplaintsQuery q, CancellationToken cancellationToken)
        {
            ComplaintsSearchSpec spec = new ComplaintsSearchSpec(q, _sortingExpressionProvider);
            PagedResult<Complaint> paged = await _complaintRepository.ListAsync(spec, q.Request.PageNumber, q.Request.PageSize, cancellationToken);
            return new PagedResult<ComplaintViewModel>(
                paged.TotalCount,
                paged.Items.Select(ComplaintViewModel.FromEntity).ToList(),
                q.Request.PageNumber,
                q.Request.PageSize
            );
        }
    }
}
