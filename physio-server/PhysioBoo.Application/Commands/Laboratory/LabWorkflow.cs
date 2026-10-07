using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Queries.Laboratory;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Laboratory
{
    /// <summary>Shared loading and alert raising for the laboratory workspace commands.</summary>
    internal static class LabWorkflow
    {
        /// <summary>Loads a tracked order item with what the workflow needs (patient for ranges, test for units).</summary>
        public static Task<LabOrderItem?> LoadItemAsync(ILabOrderItemRepository repository, Guid id, CancellationToken ct) =>
            repository.GetAll(i => i.Id == id, includeProperties: "LabOrder.Patient.Profile,LabTest").AsTracking().FirstOrDefaultAsync(ct);

        public static async Task RaiseAlertAsync(
            ILabAlertRepository repository,
            IUser user,
            LabOrderItem item,
            LabAlertType type,
            LabAlertSeverity severity,
            string description,
            string suggestedAction)
        {
            LabAlert alert = new LabAlert(
                Guid.NewGuid(),
                type,
                severity,
                description,
                suggestedAction,
                item.LabOrderId,
                item.Id,
                LabWorkspace.PatientName(item.LabOrder),
                item.LabOrder?.OrderNumber,
                TimeZoneHelper.GetLocalTimeNow()
            );
            alert.SetTenantId(user.GetTenantId());
            alert.SetCreatedBy(user.GetUserId());

            await repository.InsertAsync<LabAlert, Guid>(alert);
        }
    }
}
