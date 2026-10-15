namespace PhysioBoo.Application.ViewModels.Conversations
{
    // A colleague in the team chat, with the summary of the direct conversation with them (if one exists yet).
    public sealed class ChatContactViewModel
    {
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Avatar { get; set; }
        public string? RoleName { get; set; }
        public Guid? ConversationId { get; set; }
        public string? LastMessagePreview { get; set; }
        public DateTime? LastMessageAt { get; set; }
        public bool LastMessageIsMine { get; set; }
        public int UnreadCount { get; set; }
    }
}
