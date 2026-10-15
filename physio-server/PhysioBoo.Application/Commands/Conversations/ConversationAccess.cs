using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Conversations
{
    // Who may use the team chat, shared by every conversation command and query.
    // Tenant isolation comes from the global query filter, so these checks only ever see the caller's tenant.
    public static class ConversationAccess
    {
        public const int MaxContentLength = 2000;
        public const int MaxPreviewLength = 200;

        private const string PatientRoleCode = nameof(Domain.Enums.Role.PATIENT);
        private const string SuperAdminRoleCode = nameof(Domain.Enums.Role.SUPER_ADMIN);

        // Active staff: anyone holding a role other than patient or the platform super admin.
        public static readonly Expression<Func<User, bool>> IsTeamMember = u =>
            u.IsActive &&
            u.UserRoles.Any(ur => ur.Role != null && ur.Role.Code != PatientRoleCode && ur.Role.Code != SuperAdminRoleCode);

        public static async Task<bool> IsTeamMemberAsync(IUserRepository userRepository, Guid userId, CancellationToken ct)
        {
            return await userRepository
                .GetAllNoTracking(IsTeamMember)
                .AnyAsync(u => u.Id == userId, ct);
        }

        public static Task<bool> IsParticipantAsync(
            IConversationParticipantRepository participantRepository,
            Guid conversationId,
            Guid userId,
            CancellationToken ct)
        {
            return participantRepository.ExistsAsync(p => p.ConversationId == conversationId && p.UserId == userId, ct);
        }

        // Single-line, trimmed preview for the contact list.
        public static string BuildPreview(string content)
        {
            string flat = string.Join(' ', content.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries));
            return flat.Length <= MaxPreviewLength ? flat : flat[..(MaxPreviewLength - 1)] + "…";
        }
    }
}
