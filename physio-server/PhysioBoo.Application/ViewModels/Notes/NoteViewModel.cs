using System.Text.Json;
using PhysioBoo.Domain.Entities.Workspace;

namespace PhysioBoo.Application.ViewModels.Notes
{
    public sealed record NoteChecklistItemViewModel(string Text, bool Done);

    public sealed class NoteViewModel
    {
        public Guid Id { get; set; }
        public string? Title { get; set; }
        public string Content { get; set; } = string.Empty;
        public List<string> Labels { get; set; } = new();
        public List<NoteChecklistItemViewModel> Checklist { get; set; } = new();
        public DateTime? ReminderAt { get; set; }
        public bool IsPinned { get; set; }
        public bool IsArchived { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public static NoteViewModel FromEntity(Note entity)
        {
            return new NoteViewModel
            {
                Id = entity.Id,
                Title = entity.Title,
                Content = entity.Content,
                Labels = NoteJson.Read<string>(entity.LabelsJson),
                Checklist = NoteJson.Read<NoteChecklistItemViewModel>(entity.ChecklistJson),
                ReminderAt = entity.ReminderAt,
                IsPinned = entity.IsPinned,
                IsArchived = entity.IsArchived,
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt
            };
        }
    }

    // Labels and the checklist are stored as JSON text on the note; this is the only place that (de)serialises them.
    public static class NoteJson
    {
        public static string Write<T>(IEnumerable<T> items)
        {
            return JsonSerializer.Serialize(items.ToList());
        }

        public static List<T> Read<T>(string? json)
        {
            if (string.IsNullOrWhiteSpace(json)) return new List<T>();

            try
            {
                return JsonSerializer.Deserialize<List<T>>(json) ?? new List<T>();
            }
            catch (JsonException)
            {
                return new List<T>();
            }
        }
    }
}
