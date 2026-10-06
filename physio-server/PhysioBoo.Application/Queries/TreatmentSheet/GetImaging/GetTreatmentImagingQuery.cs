using PhysioBoo.Application.ViewModels.TreatmentSheet;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.TreatmentSheet.GetImaging
{
    public sealed record GetTreatmentImagingQuery(Guid PatientId, int PageNumber, int PageSize) : IRequest<PagedResult<TreatmentImagingOrderRowViewModel>>;
}
