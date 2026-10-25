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

    /// <summary>One step of a composite module: generate (or reuse) the rows of <see cref="ModuleKey"/>.</summary>
    internal sealed record DevDataStep(string ModuleKey, int Rows);

    /// <summary>
    /// A module that generates nothing itself but runs other modules in order, each at its own size.
    /// A step whose tenant already has data is reused, so running a composite twice creates nothing the second time.
    /// </summary>
    internal interface IDevDataCompositeModule : IDevDataModule
    {
        IReadOnlyList<DevDataStep> Plan(int count);
    }
}
