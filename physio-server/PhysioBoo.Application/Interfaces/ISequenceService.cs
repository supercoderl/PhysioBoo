namespace PhysioBoo.Application.Interfaces
{
    public interface ISequenceService
    {
        public Task GenerateNextCodeAsync(string entityType, CancellationToken ct);
    }
}
