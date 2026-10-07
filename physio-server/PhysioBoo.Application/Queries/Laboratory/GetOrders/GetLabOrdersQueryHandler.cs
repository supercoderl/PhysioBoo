using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Laboratory;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Laboratory.GetOrders
{
    public sealed class GetLabOrdersQueryHandler : IRequestHandler<GetLabOrdersQuery, PagedResult<LabOrderRowViewModel>>
    {
        private readonly ILabOrderRepository _labOrderRepository;
        private readonly IBedAssignmentRepository _bedAssignmentRepository;

        public GetLabOrdersQueryHandler(ILabOrderRepository labOrderRepository, IBedAssignmentRepository bedAssignmentRepository)
        {
            _labOrderRepository = labOrderRepository;
            _bedAssignmentRepository = bedAssignmentRepository;
        }

        public async Task<PagedResult<LabOrderRowViewModel>> Handle(GetLabOrdersQuery request, CancellationToken ct)
        {
            IQueryable<LabOrder> query = _labOrderRepository.GetAllNoTracking(includeProperties: LabWorkspace.OrderIncludes)
                .OrderByDescending(o => o.OrderDate)
                .ThenByDescending(o => o.OrderTime);

            int total = await query.CountAsync(ct);
            List<LabOrder> orders = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .AsSplitQuery()
                .ToListAsync(ct);

            Dictionary<Guid, string> wards = await LabWorkspace.LoadWardNamesAsync(_bedAssignmentRepository, orders.Select(o => o.PatientId), ct);

            List<LabOrderRowViewModel> rows = orders
                .Select(o => LabWorkspace.ToOrderRow(o, o.LabOrderItems.ToList(), wards))
                .ToList();

            return new PagedResult<LabOrderRowViewModel>(total, rows, request.PageNumber, request.PageSize);
        }
    }
}
