using PhysioBoo.Application.ViewModels.TreatmentSheet;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.TreatmentSheet.GetProcedures
{
    public sealed class GetTreatmentProceduresQueryHandler : IRequestHandler<GetTreatmentProceduresQuery, PagedResult<TreatmentProcedureRowViewModel>>
    {
        private readonly ITreatmentProcedureRepository _procedureRepository;

        public GetTreatmentProceduresQueryHandler(ITreatmentProcedureRepository procedureRepository)
        {
            _procedureRepository = procedureRepository;
        }

        public async Task<PagedResult<TreatmentProcedureRowViewModel>> Handle(GetTreatmentProceduresQuery request, CancellationToken cancellationToken)
        {
            PagedResult<TreatmentProcedure> paged = await _procedureRepository.GetPagedAsync(
                request.PageNumber,
                request.PageSize,
                filter: p => p.PatientId == request.PatientId,
                orderBy: q => q.OrderByDescending(p => p.ScheduledAt),
                ct: cancellationToken);

            return new PagedResult<TreatmentProcedureRowViewModel>(
                paged.TotalCount,
                paged.Items.Select(TreatmentProcedureRowViewModel.FromEntity).ToList(),
                request.PageNumber,
                request.PageSize
            );
        }
    }
}
