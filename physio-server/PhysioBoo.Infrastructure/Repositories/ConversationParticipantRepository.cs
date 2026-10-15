using PhysioBoo.Domain.Entities.Workspace;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class ConversationParticipantRepository : BaseRepository<ConversationParticipant>, IConversationParticipantRepository
    {
        public ConversationParticipantRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
