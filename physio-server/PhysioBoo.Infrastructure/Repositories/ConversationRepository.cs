using PhysioBoo.Domain.Entities.Workspace;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class ConversationRepository : BaseRepository<Conversation>, IConversationRepository
    {
        public ConversationRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
