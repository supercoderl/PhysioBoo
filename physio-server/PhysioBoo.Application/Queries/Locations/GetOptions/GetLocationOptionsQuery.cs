using PhysioBoo.Application.ViewModels.Locations;

namespace PhysioBoo.Application.Queries.Locations.GetOptions
{
    public enum LocationLevel
    {
        Country,
        City,
        District,
        Ward
    }

    /// <summary>
    /// Active entries of one location level, sorted by name.
    /// <paramref name="ParentId"/> is the country / city / district whose children are wanted;
    /// it is ignored for <see cref="LocationLevel.Country"/>.
    /// </summary>
    public sealed record GetLocationOptionsQuery(LocationLevel Level, Guid? ParentId = null)
        : IRequest<List<LocationOptionViewModel>>;
}
