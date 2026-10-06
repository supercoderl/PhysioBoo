using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Notes;
using PhysioBoo.Domain.Entities.Workspace;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Notes.GetAll
{
    public sealed class GetNotesQueryHandler : IRequestHandler<GetNotesQuery, List<NoteViewModel>>
    {
        // A personal note list is small; the cap protects the page, not a real limit anyone reaches.
        private const int MaxNotes = 500;

        private readonly INoteRepository _noteRepository;
        private readonly IUser _user;

        public GetNotesQueryHandler(INoteRepository noteRepository, IUser user)
        {
            _noteRepository = noteRepository;
            _user = user;
        }

        public async Task<List<NoteViewModel>> Handle(GetNotesQuery request, CancellationToken cancellationToken)
        {
            Guid ownerId = _user.GetUserId();
            bool archived = request.Archived;

            List<Note> notes = await _noteRepository
                .GetAllNoTracking(n => n.OwnerUserId == ownerId && n.IsArchived == archived)
                .OrderByDescending(n => n.IsPinned)
                .ThenByDescending(n => n.UpdatedAt ?? n.CreatedAt)
                .Take(MaxNotes)
                .ToListAsync(cancellationToken);

            List<NoteViewModel> result = notes.Select(NoteViewModel.FromEntity).ToList();

            // Labels live in JSON text, so label and text filters run on the owner's own (small) list.
            if (!string.IsNullOrWhiteSpace(request.Label))
            {
                string label = request.Label.Trim();
                result = result.Where(n => n.Labels.Any(l => string.Equals(l, label, StringComparison.OrdinalIgnoreCase))).ToList();
            }

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string term = request.Search.Trim();
                result = result.Where(n =>
                    Contains(n.Title, term)
                    || Contains(n.Content, term)
                    || n.Labels.Any(l => Contains(l, term))
                    || n.Checklist.Any(i => Contains(i.Text, term))).ToList();
            }

            return result;
        }

        private static bool Contains(string? text, string term)
        {
            return text != null && text.Contains(term, StringComparison.OrdinalIgnoreCase);
        }
    }
}
