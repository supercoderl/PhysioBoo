using PhysioBoo.Application.ViewModels.TreatmentSheet;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.TreatmentSheet.GetLabs
{
    // Reads the laboratory module's orders; nothing is duplicated into the treatment sheet.
    public sealed class GetTreatmentLabsQueryHandler : IRequestHandler<GetTreatmentLabsQuery, PagedResult<TreatmentLabOrderRowViewModel>>
    {
        private readonly ILabOrderItemRepository _labOrderItemRepository;

        public GetTreatmentLabsQueryHandler(ILabOrderItemRepository labOrderItemRepository)
        {
            _labOrderItemRepository = labOrderItemRepository;
        }

        public async Task<PagedResult<TreatmentLabOrderRowViewModel>> Handle(GetTreatmentLabsQuery request, CancellationToken cancellationToken)
        {
            PagedResult<LabOrderItem> paged = await _labOrderItemRepository.GetPagedAsync(
                request.PageNumber,
                request.PageSize,
                filter: i => i.LabOrder!.PatientId == request.PatientId,
                orderBy: q => q.OrderByDescending(i => i.LabOrder!.OrderDate).ThenByDescending(i => i.LabOrder!.OrderTime),
                includeProperties: "LabOrder",
                ct: cancellationToken);

            return new PagedResult<TreatmentLabOrderRowViewModel>(
                paged.TotalCount,
                paged.Items.Select(TreatmentLabOrderRowViewModel.FromEntity).ToList(),
                request.PageNumber,
                request.PageSize
            );
        }
    }
}
