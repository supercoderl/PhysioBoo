using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Queries.Public.Doctors;
using PhysioBoo.Application.ViewModels.Public;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Public.Hospitals
{
    public sealed class SearchPublicHospitalsQueryHandler : IRequestHandler<SearchPublicHospitalsQuery, PagedResult<PublicHospitalViewModel>>
    {
        // Same cap as the public doctor listing; larger pages would only make scraping cheaper.
        private const int MaxPageSize = 24;
        private const int MaxSearchLength = 100;
        private const int MaxLanguages = 3;

        private readonly IHospitalRepository _hospitalRepository;

        public SearchPublicHospitalsQueryHandler(IHospitalRepository hospitalRepository)
        {
            _hospitalRepository = hospitalRepository;
        }

        public async Task<PagedResult<PublicHospitalViewModel>> Handle(SearchPublicHospitalsQuery q, CancellationToken ct)
        {
            int pageSize = Math.Clamp(q.Request.PageSize, 1, MaxPageSize);
            int pageNumber = Math.Max(1, q.Request.PageNumber);

            IQueryable<Hospital> query = PublicHospitalScope.Hospitals(_hospitalRepository.GetAllNoTracking(), q.TenantId);

            string? search = q.Request.Search?.Trim();
            if (!string.IsNullOrEmpty(search))
            {
                string pattern = "%" + EscapeLike(search.Length > MaxSearchLength ? search[..MaxSearchLength] : search) + "%";
                query = query.Where(h =>
                    EF.Functions.ILike(
                        EF.Functions.Unaccent(h.Name + " " + h.Address + " " + h.City + " " + h.StateProvince),
                        EF.Functions.Unaccent(pattern)));
            }

            if (q.Request.Filter?.Type is { } type)
            {
                query = query.Where(h => h.HospitalType == type);
            }

            int total = await query.CountAsync(ct);

            IQueryable<Hospital> page = query
                .OrderBy(h => h.Name)
                .ThenBy(h => h.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize);

            List<PublicHospitalViewModel> items = await ProjectAsync(page, ct);

            return new PagedResult<PublicHospitalViewModel>(total, items, pageNumber, pageSize);
        }

        // Shared with the service detail page so its clinic card matches the listing.
        internal static async Task<List<PublicHospitalViewModel>> ProjectAsync(IQueryable<Hospital> hospitals, CancellationToken ct)
        {
            var rows = await hospitals
                .Select(h => new
                {
                    h.Id,
                    h.Name,
                    h.HospitalType,
                    h.Address,
                    h.City,
                    h.StateProvince,
                    h.Phone,
                    h.Description,
                    h.Images,
                    h.LogoUrl,
                    h.Is24Hours,
                    h.LanguagesSupported
                })
                .ToListAsync(ct);

            return rows.Select(r => new PublicHospitalViewModel(
                r.Id,
                r.Name,
                r.HospitalType,
                PublicText.OrNull(r.Address),
                PublicText.OrNull(r.City),
                PublicText.OrNull(r.StateProvince),
                PublicText.OrNull(r.Phone),
                PublicText.OrNull(r.Description),
                PublicHospitalScope.FirstImage(r.Images) ?? PublicText.OrNull(r.LogoUrl),
                r.Is24Hours,
                PublicHospitalScope.Languages(r.LanguagesSupported, MaxLanguages)
            )).ToList();
        }

        // The search text is a literal, not a LIKE pattern.
        private static string EscapeLike(string value) =>
            value.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_");
    }
}
