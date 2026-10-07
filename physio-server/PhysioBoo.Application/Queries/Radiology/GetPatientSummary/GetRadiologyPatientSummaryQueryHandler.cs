using PhysioBoo.Application.Queries.Patients;
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Queries.Laboratory;
using PhysioBoo.Application.ViewModels.Radiology;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Radiology.GetPatientSummary
{
    public sealed class GetRadiologyPatientSummaryQueryHandler : IRequestHandler<GetRadiologyPatientSummaryQuery, RadiologyPatientStudySummaryViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly IPatientRepository _patientRepository;
        private readonly IImagingOrderRepository _imagingOrderRepository;

        public GetRadiologyPatientSummaryQueryHandler(
            IMediatorHandler bus,
            IPatientRepository patientRepository,
            IImagingOrderRepository imagingOrderRepository)
        {
            _bus = bus;
            _patientRepository = patientRepository;
            _imagingOrderRepository = imagingOrderRepository;
        }

        public async Task<RadiologyPatientStudySummaryViewModel?> Handle(GetRadiologyPatientSummaryQuery request, CancellationToken ct)
        {
            Domain.Entities.PatientInformation.Patient? patient = await PatientLookup.FindAsync(_patientRepository, request.PatientKey, ct);
            if (patient == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetRadiologyPatientSummaryQuery),
                    $"Patient '{request.PatientKey}' doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return null;
            }

            // Visit and department come from the patient's latest imaging order.
            ImagingOrder? latest = await _imagingOrderRepository
                .GetAllNoTracking(o => o.PatientId == patient.Id, includeProperties: "Appointment.Department,Doctor.Department")
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync(ct);

            return new RadiologyPatientStudySummaryViewModel(
                patient.Id,
                patient.Profile?.FullName ?? "Unknown patient",
                patient.PatientNumber,
                latest?.Appointment?.AppointmentNumber ?? string.Empty,
                latest?.Appointment?.Department?.Name ?? latest?.Doctor?.Department?.Name ?? string.Empty
            );
        }
    }
}
