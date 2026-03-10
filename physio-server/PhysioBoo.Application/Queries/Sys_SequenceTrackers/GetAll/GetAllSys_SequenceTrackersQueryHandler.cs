using MediatR;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Application.ViewModels.Sys_SequenceTrackers;
using PhysioBoo.Domain.Entities.System;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Sys_SequenceTrackers.GetAll
{
    public sealed class GetAllSys_SequenceTrackersQueryHandler : IRequestHandler<GetAllSys_SequenceTrackersQuery, PagedResult<Sys_SequenceTrackerViewModel>>
    {
        private readonly ISys_SequenceTrackerRepository _sys_SequenceTrackerRepository;
        private readonly ISortingExpressionProvider<Sys_SequenceTrackerViewModel, Sys_SequenceTracker> _sortingExpressionProvider;

        public GetAllSys_SequenceTrackersQueryHandler(
            ISys_SequenceTrackerRepository sys_SequenceTrackerRepository,
            ISortingExpressionProvider<Sys_SequenceTrackerViewModel, Sys_SequenceTracker> sortingExpressionProvider
        )
        {
            _sys_SequenceTrackerRepository = sys_SequenceTrackerRepository;
            _sortingExpressionProvider = sortingExpressionProvider;
        }

        public async Task<PagedResult<Sys_SequenceTrackerViewModel>> Handle(GetAllSys_SequenceTrackersQuery q, CancellationToken cancellationToken)
        {
            Sys_SequenceTrackersSearchSpec spec = new Sys_SequenceTrackersSearchSpec(q, _sortingExpressionProvider);

            PagedResult<Sys_SequenceTracker> paged = await _sys_SequenceTrackerRepository.ListAsync(
                spec,
                q.Request.PageNumber,
                q.Request.PageSize,
                cancellationToken
            );

            // Map to view model
            List<Sys_SequenceTrackerViewModel> items = paged.Items.Select(ss => Sys_SequenceTrackerViewModel.FromSys_SequenceTracker(ss)).ToList();
            return new PagedResult<Sys_SequenceTrackerViewModel>(paged.TotalCount, items, q.Request.PageNumber, q.Request.PageSize);
        }
    }
}
