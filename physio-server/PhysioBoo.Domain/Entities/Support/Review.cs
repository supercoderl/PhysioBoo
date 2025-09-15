using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.Support
{
    public class Review : Entity
    {
        #region Core Review Table (34)
        public Guid ReviewerId { get; private set; }
        public ReviewType ReviewType { get; private set; }
        public Guid EntityId { get; private set; }
        public Guid? AppointmentId { get; private set; }
        public int OverallRating { get; private set; }
        public int DoctorPunctuality { get; private set; }
        public int DoctorBehavior { get; private set; }
        public int TreatmentSatisfaction { get; private set; }
        public int FacilityCleanliness { get; private set; }
        public int StaffBehavior { get; private set; }
        public int ValueForMoney { get; private set; }
        public string? Title { get; private set; }
        public string? Comment { get; private set; }
        public string? Pros { get; private set; }
        public string? Cons { get; private set; }
        public bool WouldRecommend { get; private set; }
        public string? VisitedFor { get; private set; }
        public int WaitTimeMinutes { get; private set; }
        public bool IsVerified { get; private set; }
        public bool IsAnonymous { get; private set; }
        public bool IsPublished { get; private set; }
        public bool IsFeatured { get; private set; }
        public int HelpfulCount { get; private set; }
        public int NotHelpfulCount { get; private set; }
        public int ReportedCount { get; private set; }
        public ModerationStatus ModerationStatus { get; private set; }
        public string? ModerationNotes { get; private set; }
        public Guid? ModeratedBy { get; private set; }
        public DateTime? ModeratedAt { get; private set; }
        public string? ResponseText { get; private set; }
        public DateTime? ResponseDate { get; private set; }
        public Guid? RespondedBy { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }

        [ForeignKey("ReviewerId")]
        [InverseProperty("Reviews")]
        public virtual User? Reviewer { get; private set; }

        [ForeignKey("AppointmentId")]
        [InverseProperty("Reviews")]
        public virtual Appointment? Appointment { get; private set; }

        [ForeignKey("ModeratedBy")]
        [InverseProperty("ModeratedReviews")]
        public virtual User? Moderator { get; private set; }

        [ForeignKey("RespondedBy")]
        [InverseProperty("Responses")]
        public virtual User? Responder { get; private set; }
        #endregion

        #region Constructor (34)
        public Review(
            Guid id,
            Guid reviewerId,
            ReviewType reviewType,
            Guid entityId,
            Guid? appointmentId,
            int overallRating,
            int doctorPunctuality,
            int doctorBehavior,
            int treatmentSatisfaction,
            int facilityCleanliness,
            int staffBehavior,
            int valueForMoney,
            string? title,
            string? comment,
            string? pros,
            string? cons,
            bool wouldRecommend,
            string? visitedFor,
            int waitTimeMinutes,
            string? moderationNotes,
            Guid? moderatedBy,
            DateTime? moderatedAt,
            string? responseText,
            DateTime? responseDate,
            Guid? respondedBy
        ) : base(id)
        {
            ReviewerId = reviewerId;
            ReviewType = reviewType;
            EntityId = entityId;
            AppointmentId = appointmentId;
            OverallRating = overallRating;
            DoctorPunctuality = doctorPunctuality;
            DoctorBehavior = doctorBehavior;
            TreatmentSatisfaction = treatmentSatisfaction;
            FacilityCleanliness = facilityCleanliness;
            StaffBehavior = staffBehavior;
            ValueForMoney = valueForMoney;
            Title = title;
            Comment = comment;
            Pros = pros;
            Cons = cons;
            WouldRecommend = wouldRecommend;
            VisitedFor = visitedFor;
            WaitTimeMinutes = waitTimeMinutes;
            IsVerified = false;
            IsAnonymous = false;
            IsPublished = false;
            IsFeatured = false;
            HelpfulCount = 0;
            NotHelpfulCount = 0;
            ReportedCount = 0;
            ModerationStatus = ModerationStatus.Pending;
            ModerationNotes = moderationNotes;
            ModeratedBy = moderatedBy;
            ModeratedAt = moderatedAt;
            ResponseText = responseText;
            ResponseDate = responseDate;
            RespondedBy = respondedBy;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
            UpdatedAt = null;
        }
        #endregion

        #region Setter Methods (34)
        public void SetReviewerId(Guid reviewerId) { ReviewerId = reviewerId; }
        public void SetReviewType(ReviewType reviewType) { ReviewType = reviewType; }
        public void SetEntityId(Guid entityId) { EntityId = entityId; }
        public void SetAppointmentId(Guid? appointmentId) { AppointmentId = appointmentId; }
        public void SetOverallRating(int overallRating) { OverallRating = overallRating; }
        public void SetDoctorPunctuality(int doctorPunctuality) { DoctorPunctuality = doctorPunctuality; }
        public void SetDoctorBehavior(int doctorBehavior) { DoctorBehavior = doctorBehavior; }
        public void SetTreatmentSatisfaction(int treatmentSatisfaction) { TreatmentSatisfaction = treatmentSatisfaction; }
        public void SetFacilityCleanliness(int facilityCleanliness) { FacilityCleanliness = facilityCleanliness; }
        public void SetStaffBehavior(int staffBehavior) { StaffBehavior = staffBehavior; }
        public void SetValueForMoney(int valueForMoney) { ValueForMoney = valueForMoney; }
        public void SetTitle(string? title) { Title = title; }
        public void SetComment(string? comment) { Comment = comment; }
        public void SetPros(string? pros) { Pros = pros; }
        public void SetCons(string? cons) { Cons = cons; }
        public void SetWouldRecommend(bool wouldRecommend) { WouldRecommend = wouldRecommend; }
        public void SetVisitedFor(string? visitedFor) { VisitedFor = visitedFor; }
        public void SetWaitTimeMinutes(int waitTimeMinutes) { WaitTimeMinutes = waitTimeMinutes; }
        public void SetIsVerified(bool isVerified) { IsVerified = isVerified; }
        public void SetIsAnonymous(bool isAnonymous) { IsAnonymous = isAnonymous; }
        public void SetIsPublished(bool isPublished) { IsPublished = isPublished; }
        public void SetIsFeatured(bool isFeatured) { IsFeatured = isFeatured; }
        public void IncrementHelpfulCount() { HelpfulCount++; }
        public void IncrementNotHelpfulCount() { NotHelpfulCount++; }
        public void IncrementReportedCount() { ReportedCount++; }
        public void SetModerationStatus(ModerationStatus moderationStatus) { ModerationStatus = moderationStatus; }
        public void SetModerationNotes(string? moderationNotes) { ModerationNotes = moderationNotes; }
        public void SetModeratedBy(Guid? moderatedBy) { ModeratedBy = moderatedBy; }
        public void SetModeratedAt(DateTime? moderatedAt) { ModeratedAt = moderatedAt; }
        public void SetResponseText(string? responseText) { ResponseText = responseText; }
        public void SetResponseDate(DateTime? responseDate) { ResponseDate = responseDate; }
        public void SetRespondedBy(Guid? respondedBy) { RespondedBy = respondedBy; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        public void SetUpdatedAt(DateTime? updatedAt) { UpdatedAt = updatedAt; }
        #endregion
    }
}
