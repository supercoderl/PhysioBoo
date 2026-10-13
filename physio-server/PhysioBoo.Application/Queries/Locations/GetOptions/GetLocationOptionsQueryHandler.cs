using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Locations;

using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Locations.GetOptions
{
    public sealed class GetLocationOptionsQueryHandler : IRequestHandler<GetLocationOptionsQuery, List<LocationOptionViewModel>>
    {
        private readonly ICountryRepository _countryRepository;
        private readonly ICityRepository _cityRepository;
        private readonly IDistrictRepository _districtRepository;
        private readonly IGeoWardRepository _wardRepository;

        public GetLocationOptionsQueryHandler(
            ICountryRepository countryRepository,
            ICityRepository cityRepository,
            IDistrictRepository districtRepository,
            IGeoWardRepository wardRepository
        )
        {
            _countryRepository = countryRepository;
            _cityRepository = cityRepository;
            _districtRepository = districtRepository;
            _wardRepository = wardRepository;
        }

        public async Task<List<LocationOptionViewModel>> Handle(GetLocationOptionsQuery request, CancellationToken ct)
        {
            // An unknown or missing parent is not an error: the picker simply shows an empty list.
            Guid parentId = request.ParentId ?? Guid.Empty;

            return request.Level switch
            {
                LocationLevel.Country => await _countryRepository
                    .GetAllNoTracking(c => c.IsActive && c.DeletedAt == null, q => q.OrderBy(c => c.Name))
                    .Select(c => new LocationOptionViewModel(c.Id, c.Name, c.Code))
                    .ToListAsync(ct),

                LocationLevel.City => await _cityRepository
                    .GetAllNoTracking(c => c.IsActive && c.DeletedAt == null && c.CountryId == parentId, q => q.OrderBy(c => c.Name))
                    .Select(c => new LocationOptionViewModel(c.Id, c.Name, c.Code))
                    .ToListAsync(ct),

                LocationLevel.District => await _districtRepository
                    .GetAllNoTracking(d => d.IsActive && d.DeletedAt == null && d.CityId == parentId, q => q.OrderBy(d => d.Name))
                    .Select(d => new LocationOptionViewModel(d.Id, d.Name, d.Code))
                    .ToListAsync(ct),

                LocationLevel.Ward => await _wardRepository
                    .GetAllNoTracking(w => w.IsActive && w.DeletedAt == null && w.DistrictId == parentId, q => q.OrderBy(w => w.Name))
                    .Select(w => new LocationOptionViewModel(w.Id, w.Name, w.Code))
                    .ToListAsync(ct),

                _ => new List<LocationOptionViewModel>()
            };
        }
    }
}
