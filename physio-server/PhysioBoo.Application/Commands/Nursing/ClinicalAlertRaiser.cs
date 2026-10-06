using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Nursing
{
    internal static class ClinicalAlertRaiser
    {
        // Raises an alert unless the patient already has an unacknowledged one of the same type.
        // Best effort: an alert is derived data, so a failed insert never fails the command that raised it.
        public static async Task EnsureOpenAsync(
            IClinicalAlertRepository alertRepository,
            Guid patientId,
            ClinicalAlertType type,
            ClinicalAlertSeverity severity,
            string message,
            Guid tenantId,
            Guid userId,
            CancellationToken cancellationToken)
        {
            if (await alertRepository.ExistsAsync(a => a.PatientId == patientId && a.Type == type && !a.IsAcknowledged, cancellationToken))
            {
                return;
            }

            ClinicalAlert alert = new ClinicalAlert(Guid.NewGuid(), patientId, type, severity, message);
            alert.SetTenantId(tenantId);
            alert.SetCreatedBy(userId);

            await alertRepository.InsertAsync<ClinicalAlert, Guid>(alert);
        }
    }
}
