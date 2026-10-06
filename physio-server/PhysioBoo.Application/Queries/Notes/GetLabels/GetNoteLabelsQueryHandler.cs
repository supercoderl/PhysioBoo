using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Notes;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Notes.GetLabels
{
    public sealed class GetNoteLabelsQueryHandler : IRequestHandler<GetNoteLabelsQuery, List<NoteLabelViewModel>>
    {
        private readonly INoteRepository _noteRepository;
        private readonly IUser _user;

        public GetNoteLabelsQueryHandler(INoteRepository noteRepository, IUser user)
        {
            _noteRepository = noteRepository;
            _user = user;
        }

        public async Task<List<NoteLabelViewModel>> Handle(GetNoteLabelsQuery request, CancellationToken cancellationToken)
        {
            Guid ownerId = _user.GetUserId();

            List<string> labelColumns = await _noteRepository
                .GetAllNoTracking(n => n.OwnerUserId == ownerId && !n.IsArchived)
                .Select(n => n.LabelsJson)
                .ToListAsync(cancellationToken);

            return labelColumns
                .SelectMany(json => NoteJson.Read<string>(json).Distinct(StringComparer.OrdinalIgnoreCase))
                .GroupBy(label => label, StringComparer.OrdinalIgnoreCase)
                .Select(g => new NoteLabelViewModel(g.Key, g.Count()))
                .OrderBy(l => l.Label, StringComparer.OrdinalIgnoreCase)
                .ToList();
        }
    }
}
