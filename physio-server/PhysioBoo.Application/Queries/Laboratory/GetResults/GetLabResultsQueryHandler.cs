using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Laboratory;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Laboratory.GetResults
{
    public sealed class GetLabResultsQueryHandler : IRequestHandler<GetLabResultsQuery, PagedResult<LabResultEntryViewModel>>
    {
        private readonly ILabOrderItemRepository _labOrderItemRepository;

        public GetLabResultsQueryHandler(ILabOrderItemRepository labOrderItemRepository)
        {
            _labOrderItemRepository = labOrderItemRepository;
        }

        public async Task<PagedResult<LabResultEntryViewModel>> Handle(GetLabResultsQuery request, CancellationToken ct)
        {
            IQueryable<LabOrderItem> query = _labOrderItemRepository
                .GetAllNoTracking(i => i.ResultValue != null, includeProperties: LabWorkspace.ItemIncludes)
                .OrderByDescending(i => i.ResultEnteredAt ?? i.CreatedAt);

            int total = await query.CountAsync(ct);
            List<LabOrderItem> items = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(ct);

            return new PagedResult<LabResultEntryViewModel>(total, items.Select(LabWorkspace.ToResult).ToList(), request.PageNumber, request.PageSize);
        }
    }
}
