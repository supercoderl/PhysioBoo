using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Queries.Laboratory;
using PhysioBoo.Application.ViewModels.Radiology;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Radiology.GetOrders
{
    public sealed class GetImagingOrdersQueryHandler : IRequestHandler<GetImagingOrdersQuery, PagedResult<ImagingOrderRowViewModel>>
    {
        private readonly IImagingOrderRepository _imagingOrderRepository;
        private readonly IBedAssignmentRepository _bedAssignmentRepository;

        public GetImagingOrdersQueryHandler(IImagingOrderRepository imagingOrderRepository, IBedAssignmentRepository bedAssignmentRepository)
        {
            _imagingOrderRepository = imagingOrderRepository;
            _bedAssignmentRepository = bedAssignmentRepository;
        }

        public async Task<PagedResult<ImagingOrderRowViewModel>> Handle(GetImagingOrdersQuery request, CancellationToken ct)
        {
            IQueryable<ImagingOrder> query = _imagingOrderRepository
                .GetAllNoTracking(includeProperties: RadiologyWorkspace.OrderIncludes)
                .OrderByDescending(o => o.CreatedAt);

            int total = await query.CountAsync(ct);
            List<ImagingOrder> orders = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .AsSplitQuery()
                .ToListAsync(ct);

            Dictionary<Guid, string> wards = await LabWorkspace.LoadWardNamesAsync(_bedAssignmentRepository, orders.Select(o => o.PatientId), ct);

            return new PagedResult<ImagingOrderRowViewModel>(
                total,
                orders.Select(o => RadiologyWorkspace.ToOrderRow(o, wards)).ToList(),
                request.PageNumber,
                request.PageSize);
        }
    }
}
