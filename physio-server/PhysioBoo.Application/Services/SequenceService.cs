using PhysioBoo.Application.Interfaces;

namespace PhysioBoo.Application.Services
{
    public class SequenceService : ISequenceService
    {
        public SequenceService()
        {

        }

        public Task GenerateNextCodeAsync(string entityType, CancellationToken ct)
        {
            throw new NotImplementedException();
        }
    }
}
