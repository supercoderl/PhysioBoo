using PhysioBoo.Domain.Entities.Workspace;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class ConversationMessageRepository : BaseRepository<ConversationMessage>, IConversationMessageRepository
    {
        public ConversationMessageRepository(ApplicationDbContext context) : base(context)
        {

        }
    }
}
