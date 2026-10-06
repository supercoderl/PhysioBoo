using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Admissions
{
    // Loads the current bed assignment (with bed and ward) of the given admissions in one query.
    internal static class OpenStayLoader
    {
        public static async Task<Dictionary<Guid, BedAssignment>> LoadAsync(
            IBedAssignmentRepository bedAssignmentRepository,
            IReadOnlyCollection<Guid> admissionIds,
            CancellationToken cancellationToken)
        {
            if (admissionIds.Count == 0) return new Dictionary<Guid, BedAssignment>();

            List<Guid> ids = admissionIds.ToList();

            List<BedAssignment> stays = await bedAssignmentRepository
                .GetAllNoTracking(
                    filter: a => a.AdmissionId != null && ids.Contains(a.AdmissionId.Value) && a.DischargedAt == null,
                    includeProperties: "Bed.Ward")
                .ToListAsync(cancellationToken);

            return stays.ToDictionary(a => a.AdmissionId!.Value);
        }
    }
}
