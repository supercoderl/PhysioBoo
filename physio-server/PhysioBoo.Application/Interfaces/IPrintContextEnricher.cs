namespace PhysioBoo.Application.Interfaces
{
    public interface IPrintContextEnricher
    {
        public Task<IReadOnlyDictionary<string, object?>> EnrichAsync(IReadOnlyDictionary<string, object?> userProvided, CancellationToken ct);
    }
}
