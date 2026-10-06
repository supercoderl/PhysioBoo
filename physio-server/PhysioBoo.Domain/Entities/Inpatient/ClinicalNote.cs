namespace PhysioBoo.Domain.Entities.Inpatient
{
    // One feed for doctor, nursing and consultation notes. The write time is CreatedAt.
    public class ClinicalNote : TenantEntity
    {
        #region Core ClinicalNote Table (4)
        public Guid PatientId { get; private set; }
        public ClinicalNoteType NoteType { get; private set; }
        public string Content { get; private set; }
        public string AuthorName { get; private set; }
        #endregion

        #region Constructor (4)
        public ClinicalNote(
            Guid id,
            Guid patientId,
            ClinicalNoteType noteType,
            string content,
            string authorName
        ) : base(id)
        {
            PatientId = patientId;
            NoteType = noteType;
            Content = content;
            AuthorName = authorName;
        }
        #endregion
    }
}
