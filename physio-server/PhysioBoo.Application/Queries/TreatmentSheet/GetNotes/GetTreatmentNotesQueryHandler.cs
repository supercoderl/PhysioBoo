using PhysioBoo.Application.ViewModels.TreatmentSheet;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.TreatmentSheet.GetNotes
{
    public sealed class GetTreatmentNotesQueryHandler : IRequestHandler<GetTreatmentNotesQuery, PagedResult<TreatmentProgressNoteViewModel>>
    {
        private readonly IClinicalNoteRepository _noteRepository;

        public GetTreatmentNotesQueryHandler(IClinicalNoteRepository noteRepository)
        {
            _noteRepository = noteRepository;
        }

        public async Task<PagedResult<TreatmentProgressNoteViewModel>> Handle(GetTreatmentNotesQuery request, CancellationToken cancellationToken)
        {
            PagedResult<ClinicalNote> paged = await _noteRepository.GetPagedAsync(
                request.PageNumber,
                request.PageSize,
                filter: n => n.PatientId == request.PatientId,
                orderBy: q => q.OrderByDescending(n => n.CreatedAt),
                ct: cancellationToken);

            return new PagedResult<TreatmentProgressNoteViewModel>(
                paged.TotalCount,
                paged.Items.Select(TreatmentProgressNoteViewModel.FromEntity).ToList(),
                request.PageNumber,
                request.PageSize
            );
        }
    }
}
