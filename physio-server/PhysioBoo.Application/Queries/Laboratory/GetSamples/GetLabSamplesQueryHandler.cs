using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Laboratory;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Laboratory.GetSamples
{
    public sealed class GetLabSamplesQueryHandler : IRequestHandler<GetLabSamplesQuery, PagedResult<LabSampleViewModel>>
    {
        private readonly ILabOrderItemRepository _labOrderItemRepository;

        public GetLabSamplesQueryHandler(ILabOrderItemRepository labOrderItemRepository)
        {
            _labOrderItemRepository = labOrderItemRepository;
        }

        public async Task<PagedResult<LabSampleViewModel>> Handle(GetLabSamplesQuery request, CancellationToken ct)
        {
            IQueryable<LabOrderItem> query = _labOrderItemRepository
                .GetAllNoTracking(i => i.LabOrder!.OrderStatus != OrderStatus.Cancelled, includeProperties: LabWorkspace.ItemIncludes)
                .OrderByDescending(i => i.LabOrder!.OrderDate)
                .ThenByDescending(i => i.LabOrder!.OrderTime);

            int total = await query.CountAsync(ct);
            List<LabOrderItem> items = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(ct);

            return new PagedResult<LabSampleViewModel>(total, items.Select(LabWorkspace.ToSample).ToList(), request.PageNumber, request.PageSize);
        }
    }
}
