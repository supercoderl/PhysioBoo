using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Commands.Conversations;
using PhysioBoo.Application.ViewModels.Conversations;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Conversations.GetContacts
{
    public sealed class GetChatContactsQueryHandler : IRequestHandler<GetChatContactsQuery, List<ChatContactViewModel>>
    {
        // A clinic's staff list is small; the cap protects the side panel, not a real limit anyone reaches.
        private const int MaxContacts = 500;

        private readonly IUserRepository _userRepository;
        private readonly IConversationParticipantRepository _participantRepository;
        private readonly IUser _user;

        public GetChatContactsQueryHandler(
            IUserRepository userRepository,
            IConversationParticipantRepository participantRepository,
            IUser user
        )
        {
            _userRepository = userRepository;
            _participantRepository = participantRepository;
            _user = user;
        }

        public async Task<List<ChatContactViewModel>> Handle(GetChatContactsQuery request, CancellationToken ct)
        {
            Guid me = _user.GetUserId();

            // The list is polled from the admin layout, so a non-staff caller gets an empty list rather than an error page.
            if (!await ConversationAccess.IsTeamMemberAsync(_userRepository, me, ct))
            {
                return new List<ChatContactViewModel>();
            }

            var members = await _userRepository
                .GetAllNoTracking(ConversationAccess.IsTeamMember)
                .Where(u => u.Id != me)
                .Select(u => new
                {
                    u.Id,
                    u.Email,
                    u.ProfilePicture,
                    FirstName = u.Profile != null ? u.Profile.FirstName : null,
                    MiddleName = u.Profile != null ? u.Profile.MiddleName : null,
                    LastName = u.Profile != null ? u.Profile.LastName : null,
                    RoleName = u.UserRoles
                        .Where(ur => ur.Role != null)
                        .OrderBy(ur => ur.AssignedAt)
                        .Select(ur => ur.Role!.Name)
                        .FirstOrDefault()
                })
                .Take(MaxContacts)
                .ToListAsync(ct);

            // My direct conversations, each with the other member and how many of their messages I haven't read.
            var conversations = await _participantRepository
                .GetAllNoTracking(p => p.UserId == me && p.Conversation!.DirectKey != null)
                .Select(p => new
                {
                    p.ConversationId,
                    PeerId = p.Conversation!.Participants
                        .Where(o => o.UserId != me)
                        .Select(o => o.UserId)
                        .FirstOrDefault(),
                    p.Conversation.LastMessageAt,
                    p.Conversation.LastMessagePreview,
                    p.Conversation.LastMessageSenderId,
                    UnreadCount = p.Conversation.Messages
                        .Count(m => m.SenderUserId != me && (p.LastReadAt == null || m.CreatedAt > p.LastReadAt))
                })
                .ToListAsync(ct);

            var byPeer = conversations
                .GroupBy(c => c.PeerId)
                .ToDictionary(g => g.Key, g => g.First());

            List<ChatContactViewModel> contacts = members.Select(m =>
            {
                byPeer.TryGetValue(m.Id, out var conversation);
                string name = string.Join(' ', new[] { m.FirstName, m.MiddleName, m.LastName }.Where(n => !string.IsNullOrWhiteSpace(n)));

                return new ChatContactViewModel
                {
                    UserId = m.Id,
                    Name = string.IsNullOrWhiteSpace(name) ? m.Email : name,
                    Email = m.Email,
                    Avatar = m.ProfilePicture,
                    RoleName = m.RoleName,
                    ConversationId = conversation?.ConversationId,
                    LastMessagePreview = conversation?.LastMessagePreview,
                    LastMessageAt = conversation?.LastMessageAt,
                    LastMessageIsMine = conversation?.LastMessageSenderId == me,
                    UnreadCount = conversation?.UnreadCount ?? 0
                };
            }).ToList();

            return contacts
                .OrderByDescending(c => c.LastMessageAt.HasValue)
                .ThenByDescending(c => c.LastMessageAt)
                .ThenBy(c => c.Name, StringComparer.OrdinalIgnoreCase)
                .ToList();
        }
    }
}
