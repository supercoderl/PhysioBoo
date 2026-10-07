using PhysioBoo.Application.Queries.Patients;
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Laboratory;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Laboratory.GetPatientSummary
{
    public sealed class GetLabPatientSummaryQueryHandler : IRequestHandler<GetLabPatientSummaryQuery, LabPatientResultSummaryViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly IPatientRepository _patientRepository;
        private readonly ILabOrderRepository _labOrderRepository;

        public GetLabPatientSummaryQueryHandler(
            IMediatorHandler bus,
            IPatientRepository patientRepository,
            ILabOrderRepository labOrderRepository)
        {
            _bus = bus;
            _patientRepository = patientRepository;
            _labOrderRepository = labOrderRepository;
        }

        public async Task<LabPatientResultSummaryViewModel?> Handle(GetLabPatientSummaryQuery request, CancellationToken ct)
        {
            Domain.Entities.PatientInformation.Patient? patient = await PatientLookup.FindAsync(_patientRepository, request.PatientKey, ct);
            if (patient == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetLabPatientSummaryQuery),
                    $"Patient '{request.PatientKey}' doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return null;
            }

            // Visit and department come from the patient's latest lab order.
            LabOrder? latest = await _labOrderRepository
                .GetAllNoTracking(o => o.PatientId == patient.Id, includeProperties: "Appointment.Department,Doctor.Department")
                .OrderByDescending(o => o.OrderDate)
                .ThenByDescending(o => o.OrderTime)
                .FirstOrDefaultAsync(ct);

            return new LabPatientResultSummaryViewModel(
                patient.Id,
                patient.Profile?.FullName ?? "Unknown patient",
                patient.PatientNumber,
                LabWorkspace.VisitNumber(latest),
                LabWorkspace.DepartmentName(latest)
            );
        }
    }
}
