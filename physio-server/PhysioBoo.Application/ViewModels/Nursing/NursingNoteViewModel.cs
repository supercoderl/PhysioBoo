using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Nursing
{
    // Matches the frontend NursingNote type (shared/types/nursing.types.ts).
    public sealed class NursingNoteViewModel
    {
        public Guid Id { get; set; }
        public DateTime Time { get; set; }
        public string Type { get; set; } = string.Empty;        // "nursing" | "doctor" | "general"
        public string Content { get; set; } = string.Empty;
        public string WrittenBy { get; set; } = string.Empty;

        public static NursingNoteViewModel FromEntity(ClinicalNote entity)
        {
            return new NursingNoteViewModel
            {
                Id = entity.Id,
                Time = entity.CreatedAt,
                Type = entity.NoteType switch
                {
                    ClinicalNoteType.Nursing => "nursing",
                    ClinicalNoteType.Doctor => "doctor",
                    _ => "general"
                },
                Content = entity.Content,
                WrittenBy = entity.AuthorName
            };
        }
    }
}
