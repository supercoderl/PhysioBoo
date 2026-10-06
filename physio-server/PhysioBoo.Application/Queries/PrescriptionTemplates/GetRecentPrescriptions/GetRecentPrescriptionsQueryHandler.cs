using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.PrescriptionTemplates;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.PrescriptionTemplates.GetRecentPrescriptions
{
    public sealed class GetRecentPrescriptionsQueryHandler : IRequestHandler<GetRecentPrescriptionsQuery, List<RecentPrescriptionViewModel>>
    {
        private readonly IPrescriptionRepository _prescriptionRepository;

        public GetRecentPrescriptionsQueryHandler(IPrescriptionRepository prescriptionRepository)
        {
            _prescriptionRepository = prescriptionRepository;
        }

        public async Task<List<RecentPrescriptionViewModel>> Handle(GetRecentPrescriptionsQuery request, CancellationToken ct)
        {
            var prescriptions = await _prescriptionRepository
                .GetAllNoTracking(p => p.PatientId == request.PatientId && p.Status != PrescriptionStatus.Draft)
                .OrderByDescending(p => p.PrescriptionDate)
                .ThenByDescending(p => p.CreatedAt)
                .Take(Math.Clamp(request.Take, 1, 20))
                .Select(p => new
                {
                    p.Id,
                    p.PrescriptionNumber,
                    p.PrescriptionDate,
                    p.Status,
                    Medications = p.PrescriptionItems.Select(i => i.MedicineName).ToList()
                })
                .ToListAsync(ct);

            return prescriptions.Select(p => new RecentPrescriptionViewModel
            {
                Id = p.Id,
                PrescriptionNumber = p.PrescriptionNumber,
                Date = p.PrescriptionDate,
                // The prescribing screen only knows Draft / Issued / Cancelled / Expired; dispensed ones were issued.
                Status = p.Status switch
                {
                    PrescriptionStatus.Cancelled => "Cancelled",
                    PrescriptionStatus.Expired => "Expired",
                    _ => "Issued"
                },
                MedicationNames = p.Medications
            }).ToList();
        }
    }
}
