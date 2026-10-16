using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.Queries.Public.Services
{
    // Which services the public website may show. Query filters are skipped for the same reason as
    // PublicDoctorScope: every condition is written out against the site's tenant.
    public static class PublicServiceScope
    {
        // Published services of the tenant. A service tied to a clinic is shown only while that clinic is public
        // (`publicHospitals` is PublicHospitalScope.Hospitals for the same tenant).
        public static IQueryable<MedicalService> Services(IQueryable<MedicalService> source, IQueryable<Hospital> publicHospitals, Guid tenantId) =>
            source.IgnoreQueryFilters().Where(s =>
                s.TenantId == tenantId &&
                s.DeletedAt == null &&
                s.Status == ServiceStatus.Active &&
                s.ArchivedAt == null &&
                (s.HospitalId == null || publicHospitals.Any(h => h.Id == s.HospitalId)));
    }
}
