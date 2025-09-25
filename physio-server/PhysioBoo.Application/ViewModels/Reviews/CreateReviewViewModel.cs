using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Reviews
{
    public sealed record CreateReviewViewModel
    (
         Guid Id,
         ReviewType ReviewType,
         Guid EntityId,
         Guid? AppointmentId,
         int OverallRating,
         int DoctorPunctuality,
         int DoctorBehavior,
         int TreatmentSatisfaction,
         int FacilityCleanliness,
         int StaffBehavior,
         int ValueForMoney,
         string? Title,
         string? Comment,
         string? Pros,
         string? Cons,
         bool WouldRecommend,
         string? VisitedFor,
         int WaitTimeMinutes,
         string? ModerationNotes,
         Guid? ModeratedBy,
         DateTime? ModeratedAt
    );
}
