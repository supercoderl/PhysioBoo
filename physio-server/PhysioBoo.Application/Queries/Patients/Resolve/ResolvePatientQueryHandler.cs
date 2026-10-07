using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Patients.Resolve
{
    public sealed class ResolvePatientQueryHandler : IRequestHandler<ResolvePatientQuery, Guid?>
    {
        private readonly IMediatorHandler _bus;
        private readonly IPatientRepository _patientRepository;

        public ResolvePatientQueryHandler(IMediatorHandler bus, IPatientRepository patientRepository)
        {
            _bus = bus;
            _patientRepository = patientRepository;
        }

        public async Task<Guid?> Handle(ResolvePatientQuery request, CancellationToken ct)
        {
            Domain.Entities.PatientInformation.Patient? patient = await PatientLookup.FindAsync(_patientRepository, request.PatientKey, ct);
            if (patient != null) return patient.Id;

            await _bus.RaiseEventAsync(new DomainNotification(nameof(ResolvePatientQuery), $"Patient '{request.PatientKey}' doesn't exist.", ErrorCodes.ObjectNotFound));
            return null;
        }
    }
}
