using PhysioBoo.Application.ViewModels.Nursing;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Nursing.GetNotes
{
    // Returns the shared clinical feed (doctor, nursing and consultation notes), newest first.
    public sealed class GetNursingNotesQueryHandler : IRequestHandler<GetNursingNotesQuery, PagedResult<NursingNoteViewModel>>
    {
        private readonly IClinicalNoteRepository _noteRepository;

        public GetNursingNotesQueryHandler(IClinicalNoteRepository noteRepository)
        {
            _noteRepository = noteRepository;
        }

        public async Task<PagedResult<NursingNoteViewModel>> Handle(GetNursingNotesQuery request, CancellationToken cancellationToken)
        {
            PagedResult<ClinicalNote> paged = await _noteRepository.GetPagedAsync(
                request.PageNumber,
                request.PageSize,
                filter: n => n.PatientId == request.PatientId,
                orderBy: q => q.OrderByDescending(n => n.CreatedAt),
                ct: cancellationToken);

            return new PagedResult<NursingNoteViewModel>(
                paged.TotalCount,
                paged.Items.Select(NursingNoteViewModel.FromEntity).ToList(),
                request.PageNumber,
                request.PageSize
            );
        }
    }
}
