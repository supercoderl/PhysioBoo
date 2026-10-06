using PhysioBoo.Domain.Entities.Finance;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.Commands.InsuranceClaims
{
    /// <summary>
    /// Builds timeline / note / message / audit rows for a claim, stamped with the current user.
    /// </summary>
    public static class InsuranceClaimActivityFactory
    {
        public static InsuranceClaimActivity Create(
            IUser user,
            Guid claimId,
            InsuranceClaimActivityKind kind,
            string? eventType,
            string? message = null,
            string? details = null,
            string? direction = null,
            Guid? id = null
        )
        {
            InsuranceClaimActivity activity = new InsuranceClaimActivity(
                id ?? Guid.NewGuid(),
                claimId,
                kind,
                eventType,
                direction,
                user.GetUserEmail(),
                message,
                details,
                DateTime.UtcNow
            );

            activity.SetTenantId(user.GetTenantId());
            activity.SetCreatedBy(user.GetUserId());
            return activity;
        }
    }
}
