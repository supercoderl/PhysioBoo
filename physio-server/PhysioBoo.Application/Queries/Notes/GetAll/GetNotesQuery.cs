using PhysioBoo.Application.ViewModels.Notes;

namespace PhysioBoo.Application.Queries.Notes.GetAll
{
    // The signed-in user's notes, pinned first and then most recently changed. Archived notes only when asked for.
    public sealed record GetNotesQuery(string? Search, string? Label, bool Archived) : IRequest<List<NoteViewModel>>;
}
