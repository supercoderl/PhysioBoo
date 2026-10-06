using PhysioBoo.Application.ViewModels.TreatmentSheet;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.TreatmentSheet.GetNotes
{
    public sealed record GetTreatmentNotesQuery(Guid PatientId, int PageNumber, int PageSize) : IRequest<PagedResult<TreatmentProgressNoteViewModel>>;
}
