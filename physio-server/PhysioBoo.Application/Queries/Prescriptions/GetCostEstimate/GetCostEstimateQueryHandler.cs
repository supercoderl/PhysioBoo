
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Prescriptions;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Errors;

using PhysioBoo.Domain.Interfaces.Repositories;


namespace PhysioBoo.Application.Queries.Prescriptions.GetCostEstimate
{
    public sealed class GetCostEstimateQueryHandler : IRequestHandler<GetCostEstimateQuery, PrescriptionSummaryTotalsViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly IPrescriptionRepository _prescriptionRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IMedicineRepository _medicineRepository;

        public GetCostEstimateQueryHandler(
            IMediatorHandler bus,
            IPrescriptionRepository prescriptionRepository,
            IPatientRepository patientRepository,
            IMedicineRepository medicineRepository
        )
        {
            _bus = bus;
            _prescriptionRepository = prescriptionRepository;
            _patientRepository = patientRepository;
            _medicineRepository = medicineRepository;
        }

        public async Task<PrescriptionSummaryTotalsViewModel?> Handle(GetCostEstimateQuery request, CancellationToken ct)
        {
            Prescription? prescription = await _prescriptionRepository.GetByIdAsync(request.PrescriptionId, ct: ct);

            if (prescription == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(nameof(GetCostEstimateQuery),
                    $"Prescription with id {request.PrescriptionId} doesn't exist.", ErrorCodes.ObjectNotFound));
                return null;
            }

            Patient? patient = await _patientRepository.GetByIdAsync(prescription.PatientId, ct: ct);
            decimal coveragePercent = Math.Clamp(patient?.InssuranceCoverageAmount ?? 0m, 0m, 100m);
            decimal totalCost = 0m;
            List<Guid> medicineIds = request.Items.Select(i => i.MedicineId).Distinct().ToList();
            List<Medicine> medicines = await _medicineRepository.GetAllNoTracking(filter: m => medicineIds.Contains(m.Id)).ToListAsync(ct);
            Dictionary<Guid, Medicine> medicinesById = medicines.ToDictionary(m => m.Id);

            foreach (CostEstimateItemInput item in request.Items)
            {
                Medicine? medicine = medicinesById.GetValueOrDefault(item.MedicineId);
                decimal unitPrice = medicine?.SellingPrice ?? medicine?.Mrp ?? item.ClientPricePerUnit;
                totalCost += unitPrice * item.QuantityPrescribed;
            }

            decimal insuranceCoverageAmount = Math.Round(totalCost * coveragePercent / 100m, 2);
            decimal patientPayment = totalCost - insuranceCoverageAmount;

            return new PrescriptionSummaryTotalsViewModel
            {
                TotalCost = totalCost,
                InsuranceCoverageAmount = insuranceCoverageAmount,
                InsuranceCoveragePercent = coveragePercent,
                PatientPayment = patientPayment,
                Currency = "VND"
            };
        }
    }
}
