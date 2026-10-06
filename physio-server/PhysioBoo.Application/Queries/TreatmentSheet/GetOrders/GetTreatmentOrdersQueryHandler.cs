using PhysioBoo.Application.ViewModels.TreatmentSheet;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.TreatmentSheet.GetOrders
{
    public sealed class GetTreatmentOrdersQueryHandler : IRequestHandler<GetTreatmentOrdersQuery, PagedResult<TreatmentOrderViewModel>>
    {
        private readonly ITreatmentOrderRepository _orderRepository;

        public GetTreatmentOrdersQueryHandler(ITreatmentOrderRepository orderRepository)
        {
            _orderRepository = orderRepository;
        }

        public async Task<PagedResult<TreatmentOrderViewModel>> Handle(GetTreatmentOrdersQuery request, CancellationToken cancellationToken)
        {
            PagedResult<TreatmentOrder> paged = await _orderRepository.GetPagedAsync(
                request.PageNumber,
                request.PageSize,
                filter: o => o.PatientId == request.PatientId,
                orderBy: q => q.OrderByDescending(o => o.StartTime),
                ct: cancellationToken);

            return new PagedResult<TreatmentOrderViewModel>(
                paged.TotalCount,
                paged.Items.Select(TreatmentOrderViewModel.FromEntity).ToList(),
                request.PageNumber,
                request.PageSize
            );
        }
    }
}
