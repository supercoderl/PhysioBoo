using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Queries.Public.Doctors;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;
using System.Text.Json;

namespace PhysioBoo.Application.Queries.Public.Hospitals
{
    // Which clinics and clinic data the public website may show. Query filters are skipped for the same reason as
    // PublicDoctorScope: every condition is written out against the site's tenant.
    public static class PublicHospitalScope
    {
        public static IQueryable<Hospital> Hospitals(IQueryable<Hospital> source, Guid tenantId) =>
            source.IgnoreQueryFilters().Where(h =>
                h.TenantId == tenantId &&
                h.DeletedAt == null &&
                h.IsActive);

        // Services the tenant has published at this clinic.
        public static IQueryable<MedicalService> ServicesAt(IQueryable<MedicalService> source, Guid tenantId, Guid hospitalId) =>
            source.IgnoreQueryFilters().Where(s =>
                s.TenantId == tenantId &&
                s.DeletedAt == null &&
                s.Status == ServiceStatus.Active &&
                s.HospitalId == hospitalId);

        // `Images` is a JSON array of URLs; anything unreadable counts as no photo.
        public static string? FirstImage(string? json)
        {
            if (string.IsNullOrWhiteSpace(json)) return null;
            try
            {
                return JsonSerializer.Deserialize<string[]>(json)?.Select(PublicText.OrNull).FirstOrDefault(u => u != null);
            }
            catch (JsonException)
            {
                return null;
            }
        }

        // Only absolute http(s) links are published, so a stored value can't become a script link.
        public static string? WebUrl(string? value) =>
            Uri.TryCreate(value?.Trim(), UriKind.Absolute, out Uri? uri) && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps)
                ? uri.ToString()
                : null;

        public static List<string> Languages(string[]? languages, int max = int.MaxValue) =>
            (languages ?? Array.Empty<string>())
                .Where(l => !string.IsNullOrWhiteSpace(l))
                .Select(l => l.Trim())
                .Distinct()
                .Take(max)
                .ToList();
    }
}
