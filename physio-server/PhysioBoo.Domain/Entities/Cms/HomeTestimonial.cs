namespace PhysioBoo.Domain.Entities.Cms
{
    public class HomeTestimonial : TenantEntity
    {
        #region Core HomeTestimonial Table (5)
        public string PatientName { get; private set; }
        public int Rating { get; private set; }
        public string? Comment { get; private set; }
        public DateTime? Date { get; private set; }
        public bool Active { get; private set; }
        #endregion

        #region Constructor (5)
        public HomeTestimonial(
            Guid id,
            string patientName,
            int rating,
            string? comment,
            DateTime? date,
            bool active
        ) : base(id)
        {
            PatientName = patientName;
            Rating = rating;
            Comment = comment;
            Date = date;
            Active = active;
        }
        #endregion

        #region Setter Methods (5)
        public void SetPatientName(string patientName) { PatientName = patientName; }
        public void SetRating(int rating) { Rating = rating; }
        public void SetComment(string? comment) { Comment = comment; }
        public void SetDate(DateTime? date) { Date = date; }
        public void SetActive(bool active) { Active = active; }
        #endregion
    }
}
