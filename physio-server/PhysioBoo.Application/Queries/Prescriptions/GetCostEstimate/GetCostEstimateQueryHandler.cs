
using PhysioBoo.Application.ViewModels.Prescriptions;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

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

            // Insurance coverage is stored as a percentage (0-100) on Patient.InssuranceCoverageAmount.
            decimal coveragePercent = Math.Clamp(patient?.InssuranceCoverageAmount ?? 0m, 0m, 100m);

            decimal totalCost = 0m;

            foreach (CostEstimateItemInput item in request.Items)
            {
                // Trust the catalog price for a real catalog medicine; only fall back to the
                // client-supplied price for a custom/non-catalog entry that has no catalog row
                // to price from (see prescription-redesign.md IsCatalogVerified).
                Medicine? medicine = await _medicineRepository.GetByIdAsync(item.MedicineId, ct: ct);
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
