namespace PhysioBoo.Application.ViewModels.Notes
{
    // Used for both create and update: an update replaces the whole note.
    public sealed record SaveNoteViewModel(
        string? Title,
        string? Content,
        List<string>? Labels,
        List<NoteChecklistItemViewModel>? Checklist,
        DateTime? ReminderAt,
        bool IsPinned,
        bool IsArchived
    );

    public sealed record NoteLabelViewModel(string Label, int Count);
}
