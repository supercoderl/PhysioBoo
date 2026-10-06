namespace PhysioBoo.Domain.Entities.Academy
{
    // CourseId is a plain reference; Position is 0-based and decides the reading order.
    public class Lesson : TenantEntity
    {
        #region Core Lesson Table (5)
        public Guid CourseId { get; private set; }
        public string Title { get; private set; }
        public string Content { get; private set; }
        public int DurationMinutes { get; private set; }
        public int Position { get; private set; }
        #endregion

        #region Constructor (5)
        public Lesson(
            Guid id,
            Guid courseId,
            string title,
            string content,
            int durationMinutes,
            int position
        ) : base(id)
        {
            CourseId = courseId;
            Title = title;
            Content = content;
            DurationMinutes = durationMinutes;
            Position = position;
        }
        #endregion

        #region Setter Methods (5)
        public void SetTitle(string title) { Title = title; }
        public void SetContent(string content) { Content = content; }
        public void SetDurationMinutes(int durationMinutes) { DurationMinutes = durationMinutes; }
        public void SetPosition(int position) { Position = position; }
        #endregion
    }
}
