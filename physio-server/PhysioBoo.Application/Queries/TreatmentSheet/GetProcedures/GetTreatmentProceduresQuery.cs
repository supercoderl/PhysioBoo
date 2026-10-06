using PhysioBoo.Application.ViewModels.TreatmentSheet;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.TreatmentSheet.GetProcedures
{
    public sealed record GetTreatmentProceduresQuery(Guid PatientId, int PageNumber, int PageSize) : IRequest<PagedResult<TreatmentProcedureRowViewModel>>;
}
