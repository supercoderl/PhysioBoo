using PhysioBoo.Domain.Entities.Inpatient;

namespace PhysioBoo.Application.ViewModels.TreatmentSheet
{
    public sealed class TreatmentProgressNoteViewModel
    {
        public Guid Id { get; set; }
        public string Type { get; set; } = string.Empty;        // Doctor | Nursing | Consultation
        public string Content { get; set; } = string.Empty;
        public string AuthorName { get; set; } = string.Empty;
        public DateTime WrittenAt { get; set; }

        public static TreatmentProgressNoteViewModel FromEntity(ClinicalNote entity)
        {
            return new TreatmentProgressNoteViewModel
            {
                Id = entity.Id,
                Type = entity.NoteType.ToString(),
                Content = entity.Content,
                AuthorName = entity.AuthorName,
                WrittenAt = entity.CreatedAt
            };
        }
    }
}
