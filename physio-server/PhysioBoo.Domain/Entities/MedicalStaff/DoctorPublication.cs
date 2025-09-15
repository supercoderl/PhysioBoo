using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.MedicalStaff
{
    public class DoctorPublication : Entity
    {
        #region Core Doctor Publication Table (22)
        public Guid DoctorId { get; private set; }
        public string Title { get; private set; }
        public PublicationType PublicationType { get; private set; }
        public string? JournalName { get; private set; }
        public string? ConferenceName { get; private set; }
        public string? Publisher { get; private set; }
        public DateOnly? PublicationDate { get; private set; }
        public string? Volume { get; private set; }
        public string? Issue { get; private set; }
        public string? Pages { get; private set; }
        public string? Doi { get; private set; }
        public string? Pmid { get; private set; }
        public string? Isbm { get; private set; }
        public decimal? ImpactFactor { get; private set; }
        public int CitationCount { get; private set; }
        public string? CoAuthors { get; private set; }
        public string? Abstract { get; private set; }
        public string[] Keywords { get; private set; }
        public bool IsPeerReviewed { get; private set; }
        public string? PublicationUrl { get; private set; }
        public string? PdfUrl { get; private set; }
        public DateTime CreatedAt { get; private set; }

        [ForeignKey("DoctorId")]
        [InverseProperty("Publications")]
        public virtual Doctor? Doctor { get; private set; }
        #endregion

        #region Constructor (22)
        public DoctorPublication(
            Guid id,
            Guid doctorId,
            string title,
            PublicationType publicationType,
            string? journalName,
            string? conferenceName,
            string? publisher,
            DateOnly? publicationDate,
            string? volume,
            string? issue,
            string? pages,
            string? doi,
            string? pmid,
            string? isbm,
            decimal? impactFactor,
            string? coAuthors,
            string? @abstract,
            string[] keywords,
            bool isPeerReviewed,
            string? publicationUrl,
            string? pdfUrl
        ) : base(id)
        {
            DoctorId = doctorId;
            Title = title;
            PublicationType = publicationType;
            JournalName = journalName;
            ConferenceName = conferenceName;
            Publisher = publisher;
            PublicationDate = publicationDate;
            Volume = volume;
            Issue = issue;
            Pages = pages;
            Doi = doi;
            Pmid = pmid;
            Isbm = isbm;
            ImpactFactor = impactFactor;
            CitationCount = 0;
            CoAuthors = coAuthors;
            Abstract = @abstract;
            Keywords = keywords;
            IsPeerReviewed = false;
            PublicationUrl = publicationUrl;
            PdfUrl = pdfUrl;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
        }
        #endregion

        #region Setter Methods (22)
        public void SetDoctorId(Guid doctorId) { DoctorId = doctorId; }
        public void SetTitle(string title) { Title = title; }
        public void SetPublicationType(PublicationType publicationType) { PublicationType = publicationType; }
        public void SetJournalName(string? journalName) { JournalName = journalName; }
        public void SetConferenceName(string? conferenceName) { ConferenceName = conferenceName; }
        public void SetPublisher(string? publisher) { Publisher = publisher; }
        public void SetPublicationDate(DateOnly? publicationDate) { PublicationDate = publicationDate; }
        public void SetVolume(string? volume) { Volume = volume; }
        public void SetIssue(string? issue) { Issue = issue; }
        public void SetPages(string? pages) { Pages = pages; }
        public void SetDoi(string? doi) { Doi = doi; }
        public void SetPmid(string? pmid) { Pmid = pmid; }
        public void SetIsbm(string? isbm) { Isbm = isbm; }
        public void SetImpactFactor(decimal? impactFactor) { ImpactFactor = impactFactor; }
        public void SetCitationCount(int citationCount) { CitationCount = citationCount; }
        public void SetCoAuthors(string? coAuthors) { CoAuthors = coAuthors; }
        public void SetAbstract(string? @abstract) { Abstract = @abstract; }
        public void SetKeywords(string[] keywords) { Keywords = keywords; }
        public void SetIsPeerReviewed(bool isPeerReviewed) { IsPeerReviewed = isPeerReviewed; }
        public void SetPublicationUrl(string? publicationUrl) { PublicationUrl = publicationUrl; }
        public void SetPdfUrl(string? pdfUrl) { PdfUrl = pdfUrl; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        #endregion
    }
}
