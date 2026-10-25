namespace PhysioBoo.Domain.Interfaces.Seeding
{
    /// <summary>Development-only tool that fills a tenant with fake module data (see physio-app/docs/dev-data-generator-redesign.md).</summary>
    public interface IDevDataService
    {
        DevDataModuleList GetModules();

        /// <summary>
        /// Creates <paramref name="count"/> rows of a module in the real tables of <paramref name="tenantId"/>
        /// (and any missing parent data), all in one transaction.
        /// </summary>
        /// <exception cref="DevDataException">The generator is off, or the module, tenant or count is invalid.</exception>
        Task<DevDataResult> GenerateAsync(string moduleKey, Guid tenantId, int count, CancellationToken ct = default);
    }

    public sealed record DevDataModuleInfo(string Key, string Label, string Description, IReadOnlyList<string> DependsOn);

    public sealed record DevDataModuleList(bool Enabled, int MaxRows, IReadOnlyList<DevDataModuleInfo> Modules);

    /// <param name="Created">Rows written, keyed by table.</param>
    /// <param name="Reused">Keys of the modules whose data already existed and was linked to instead of generated again.</param>
    public sealed record DevDataResult(Guid BatchId, IReadOnlyDictionary<string, int> Created, IReadOnlyList<string> Warnings, IReadOnlyList<string> Reused);

    /// <summary>A request the generator cannot serve; the endpoint reports it as a 400 (never 403/404, which the app redirects on).</summary>
    public sealed class DevDataException : Exception
    {
        public DevDataException(string message) : base(message)
        {
        }
    }
}
