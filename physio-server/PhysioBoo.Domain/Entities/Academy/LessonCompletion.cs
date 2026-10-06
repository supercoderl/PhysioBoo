namespace PhysioBoo.Domain.Entities.Academy
{
    // One row per (user, lesson) the user has finished; undoing it removes the row.
    public class LessonCompletion : TenantEntity
    {
        #region Core LessonCompletion Table (4)
        public Guid CourseId { get; private set; }
        public Guid LessonId { get; private set; }
        public Guid UserId { get; private set; }
        public DateTime CompletedAt { get; private set; }
        #endregion

        #region Constructor (4)
        public LessonCompletion(
            Guid id,
            Guid courseId,
            Guid lessonId,
            Guid userId,
            DateTime completedAt
        ) : base(id)
        {
            CourseId = courseId;
            LessonId = lessonId;
            UserId = userId;
            CompletedAt = completedAt;
        }
        #endregion
    }
}
