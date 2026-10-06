using PhysioBoo.Application.ViewModels.Notes;

namespace PhysioBoo.Application.Queries.Notes.GetLabels
{
    // Every label used on the signed-in user's active notes, with how many notes carry it.
    public sealed record GetNoteLabelsQuery : IRequest<List<NoteLabelViewModel>>;
}
