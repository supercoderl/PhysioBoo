using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Radiology;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Radiology.GetStudies
{
    /// <summary>Comparison studies: the patient's earlier studies on the same modality (up to three, newest first).</summary>
    internal static class StudyComparisons
    {
        public static async Task<List<StudyRecordViewModel>> MapAsync(
            IImagingOrderRepository repository,
            IReadOnlyCollection<ImagingOrder> orders,
            CancellationToken ct)
        {
            List<Guid> patientIds = orders.Select(o => o.PatientId).Distinct().ToList();

            var history = await repository
                .GetAllNoTracking(o => patientIds.Contains(o.PatientId) && o.ImagingStartedAt != null)
                .Select(o => new { o.Id, o.PatientId, o.ModalityId, o.ImagingStartedAt })
                .ToListAsync(ct);

            return orders.Select(order =>
            {
                IEnumerable<Guid> comparisons = history
                    .Where(h => h.PatientId == order.PatientId && h.ModalityId == order.ModalityId &&
                                h.Id != order.Id && h.ImagingStartedAt < order.ImagingStartedAt)
                    .OrderByDescending(h => h.ImagingStartedAt)
                    .Take(3)
                    .Select(h => h.Id);

                return RadiologyWorkspace.ToStudy(order, comparisons);
            }).ToList();
        }
    }
}
