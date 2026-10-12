namespace PhysioBoo.Infrastructure.Database.DevData
{
    /// <summary>One module of the dev data generator. Each module writes straight into the real tables of its entities.</summary>
    internal interface IDevDataModule
    {
        string Key { get; }

        string Label { get; }

        string Description { get; }

        /// <summary>Keys of the modules whose rows this one links to; the service creates them first when the tenant has none.</summary>
        IReadOnlyList<string> DependsOn { get; }

        /// <summary>True when the tenant already has rows another module can link to.</summary>
        Task<bool> HasDataAsync(DevDataContext context, CancellationToken ct);

        /// <summary>Creates <paramref name="count"/> primary rows of this module and saves them.</summary>
        Task GenerateAsync(DevDataContext context, int count, CancellationToken ct);
    }
}
