namespace PhysioBoo.Domain.Entities.Workspace
{
    // A personal note: only its owner can see or change it.
    // Labels and the checklist are small lists that always load and save with the note, so they are
    // kept as JSON text instead of child tables (serialised in the application layer).
    public class Note : TenantEntity
    {
        #region Core Note Table (9)
        public Guid OwnerUserId { get; private set; }
        public string? Title { get; private set; }
        public string Content { get; private set; }
        public string LabelsJson { get; private set; }
        public string ChecklistJson { get; private set; }
        public DateTime? ReminderAt { get; private set; }
        public bool IsPinned { get; private set; }
        public bool IsArchived { get; private set; }
        #endregion

        #region Constructor (9)
        public Note(
            Guid id,
            Guid ownerUserId,
            string? title,
            string content,
            string labelsJson,
            string checklistJson,
            DateTime? reminderAt,
            bool isPinned
        ) : base(id)
        {
            OwnerUserId = ownerUserId;
            Title = title;
            Content = content;
            LabelsJson = labelsJson;
            ChecklistJson = checklistJson;
            ReminderAt = reminderAt;
            IsPinned = isPinned;
            IsArchived = false;
        }
        #endregion

        #region Setter Methods (9)
        public void SetTitle(string? title) { Title = title; }
        public void SetContent(string content) { Content = content; }
        public void SetLabelsJson(string labelsJson) { LabelsJson = labelsJson; }
        public void SetChecklistJson(string checklistJson) { ChecklistJson = checklistJson; }
        public void SetReminderAt(DateTime? reminderAt) { ReminderAt = reminderAt; }
        public void SetIsPinned(bool isPinned) { IsPinned = isPinned; }
        public void SetIsArchived(bool isArchived) { IsArchived = isArchived; }
        #endregion
    }
}
