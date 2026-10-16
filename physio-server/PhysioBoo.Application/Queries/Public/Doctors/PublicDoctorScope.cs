using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;
using System.Linq.Expressions;

namespace PhysioBoo.Application.Queries.Public.Doctors
{
    // Which doctors and schedules the public website may show.
    // The global query filters are skipped on purpose: for anonymous callers they apply no tenant and no
    // soft-delete condition at all, and for a signed-in visitor they would scope to *their* tenant instead of
    // the site's. Every condition is therefore written out here, against the site's tenant.
    public static class PublicDoctorScope
    {
        public static IQueryable<Doctor> Doctors(IQueryable<Doctor> source, Guid tenantId) =>
            source.IgnoreQueryFilters().Where(d =>
                d.TenantId == tenantId &&
                d.DeletedAt == null &&
                d.EmploymentStatus == EmploymentStatus.Active &&
                d.User != null && d.User.IsActive && d.User.DeletedAt == null);

        // Services the doctor delivers that the tenant has published.
        public static IQueryable<MedicalService> ServicesOf(IQueryable<MedicalService> source, Guid tenantId, Guid doctorId) =>
            source.IgnoreQueryFilters().Where(s =>
                s.TenantId == tenantId &&
                s.DeletedAt == null &&
                s.Status == ServiceStatus.Active &&
                s.Doctors.Any(x => x.DoctorId == doctorId));

        // A schedule that currently places the doctor at an active facility of the same tenant.
        public static Expression<Func<DoctorSchedule, bool>> ActiveSchedule(Guid tenantId, DateTime today) => s =>
            s.TenantId == tenantId &&
            s.DeletedAt == null &&
            s.IsAvailable &&
            (s.EffectiveTo == null || s.EffectiveTo >= today) &&
            s.Hospital != null && s.Hospital.IsActive && s.Hospital.DeletedAt == null;
    }
}
