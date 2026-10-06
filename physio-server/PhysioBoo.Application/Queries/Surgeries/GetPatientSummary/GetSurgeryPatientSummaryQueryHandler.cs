using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Surgeries;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Entities.Theatre;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Surgeries.GetPatientSummary
{
    // The patient's identity and allergies, plus consent and risk from their latest surgery that is not cancelled.
    public sealed class GetSurgeryPatientSummaryQueryHandler : IRequestHandler<GetSurgeryPatientSummaryQuery, SurgeryPatientSummaryViewModel?>
    {
        private static readonly char[] ListSeparators = { ',', ';', '\n' };

        private readonly IPatientRepository _patientRepository;
        private readonly ISurgeryCaseRepository _surgeryRepository;
        private readonly IMediatorHandler _bus;

        public GetSurgeryPatientSummaryQueryHandler(
            IPatientRepository patientRepository,
            ISurgeryCaseRepository surgeryRepository,
            IMediatorHandler bus
        )
        {
            _patientRepository = patientRepository;
            _surgeryRepository = surgeryRepository;
            _bus = bus;
        }

        public async Task<SurgeryPatientSummaryViewModel?> Handle(GetSurgeryPatientSummaryQuery request, CancellationToken cancellationToken)
        {
            Patient? patient = await _patientRepository
                .GetAllNoTracking(p => p.Id == request.PatientId, includeProperties: "Profile")
                .FirstOrDefaultAsync(cancellationToken);

            if (patient == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetSurgeryPatientSummaryQuery),
                    $"Patient with id {request.PatientId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return null;
            }

            SurgeryCase? latest = await _surgeryRepository
                .GetAllNoTracking(c => c.PatientId == request.PatientId && c.Status != SurgeryStatus.Cancelled)
                .OrderByDescending(c => c.ScheduledStart)
                .FirstOrDefaultAsync(cancellationToken);

            return new SurgeryPatientSummaryViewModel
            {
                PatientId = patient.Id,
                FullName = patient.Profile?.FullName ?? string.Empty,
                Mrn = patient.PatientNumber,
                Diagnosis = latest?.Diagnosis ?? string.Empty,
                Allergies = (patient.AllergyInformation ?? string.Empty)
                    .Split(ListSeparators, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                    .ToList(),
                ConsentStatus = (latest?.ConsentStatus ?? ConsentStatus.NotObtained).ToString(),
                RiskAssessment = latest?.RiskAssessment ?? string.Empty
            };
        }
    }
}
