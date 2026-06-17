using MediatR;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Users.GetPreferences
{
    public sealed class GetPreferencesQueryHandler : IRequestHandler<GetPreferencesQuery, IReadOnlyDictionary<string, string>>
    {
        private readonly IUserPreferenceRepository _userPreferenceRepository;
        private readonly IUser _user;

        public GetPreferencesQueryHandler(
            IUserPreferenceRepository userPreferenceRepository,
            IUser user
        )
        {
            _userPreferenceRepository = userPreferenceRepository;
            _user = user;
        }

        public async Task<IReadOnlyDictionary<string, string>> Handle(GetPreferencesQuery request, CancellationToken cancellationToken)
        {
            if (!_user.IsAuthenticated)
            {
                return new Dictionary<string, string>();
            }

            Guid userId = _user.GetUserId();
            IReadOnlyList<UserPreference> prefs = await _userPreferenceRepository.GetUserPreferencesByUserId(userId);

            return prefs.ToDictionary(p => p.Key, p => p.Value);
        }
    }
}
