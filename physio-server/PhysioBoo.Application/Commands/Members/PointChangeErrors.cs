using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Members
{
    // Maps the error code returned by IMemberRepository.ApplyPointsAsync to a user-facing message.
    internal static class PointChangeErrors
    {
        public static string Describe(string? errorCode)
        {
            return errorCode switch
            {
                ErrorCodes.ObjectNotFound => "Member doesn't exist.",
                DomainErrorCodes.Member.NotActive => "Member is not active.",
                DomainErrorCodes.PointTransaction.InsufficientPoints => "Member doesn't have enough points.",
                _ => "Failed to update the member points."
            };
        }
    }
}
