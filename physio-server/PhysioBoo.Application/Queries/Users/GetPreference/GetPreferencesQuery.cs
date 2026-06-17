using MediatR;

namespace PhysioBoo.Application.Queries.Users.GetPreferences
{
    public sealed record GetPreferencesQuery() : IRequest<IReadOnlyDictionary<string, string>>;
}
