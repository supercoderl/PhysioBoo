using PhysioBoo.Application.ViewModels.Admissions;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Admissions.GetAll
{
    public sealed class GetAllAdmissionsQueryHandler : IRequestHandler<GetAllAdmissionsQuery, PagedResult<AdmissionViewModel>>
    {
        private readonly IAdmissionRepository _admissionRepository;
        private readonly IBedAssignmentRepository _bedAssignmentRepository;
        private readonly ISortingExpressionProvider<AdmissionViewModel, Admission> _sortingExpressionProvider;

        public GetAllAdmissionsQueryHandler(
            IAdmissionRepository admissionRepository,
            IBedAssignmentRepository bedAssignmentRepository,
            ISortingExpressionProvider<AdmissionViewModel, Admission> sortingExpressionProvider
        )
        {
            _admissionRepository = admissionRepository;
            _bedAssignmentRepository = bedAssignmentRepository;
            _sortingExpressionProvider = sortingExpressionProvider;
        }

        public async Task<PagedResult<AdmissionViewModel>> Handle(GetAllAdmissionsQuery q, CancellationToken cancellationToken)
        {
            AdmissionsSearchSpec spec = new AdmissionsSearchSpec(q, _sortingExpressionProvider);
            PagedResult<Admission> paged = await _admissionRepository.ListAsync(spec, q.Request.PageNumber, q.Request.PageSize, cancellationToken);

            Dictionary<Guid, BedAssignment> stays = await OpenStayLoader.LoadAsync(
                _bedAssignmentRepository,
                paged.Items.Select(a => a.Id).ToList(),
                cancellationToken);

            return new PagedResult<AdmissionViewModel>(
                paged.TotalCount,
                paged.Items.Select(a => AdmissionViewModel.FromEntity(a, stays.GetValueOrDefault(a.Id))).ToList(),
                q.Request.PageNumber,
                q.Request.PageSize
            );
        }
    }
}
