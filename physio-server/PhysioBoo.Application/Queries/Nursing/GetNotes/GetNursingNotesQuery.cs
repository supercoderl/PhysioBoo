using PhysioBoo.Application.ViewModels.Nursing;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Nursing.GetNotes
{
    public sealed record GetNursingNotesQuery(Guid PatientId, int PageNumber, int PageSize) : IRequest<PagedResult<NursingNoteViewModel>>;
}
