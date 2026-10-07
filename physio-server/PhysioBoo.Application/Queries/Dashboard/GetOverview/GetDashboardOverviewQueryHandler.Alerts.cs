using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Dashboard;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.Queries.Dashboard.GetOverview
{
    public sealed partial class GetDashboardOverviewQueryHandler
    {
        private const int AlertsPerSource = 10;

        /// <summary>Open alerts from every module, bucketed by severity, newest first.</summary>
        private async Task<DashboardAlertsViewModel> GetAlertsAsync(CancellationToken ct)
        {
            List<(DateTime At, DashboardAlertItemViewModel Item)> all = new();

            var lab = await _labAlertRepository.GetAllNoTracking(a => !a.Acknowledged)
                .OrderByDescending(a => a.RaisedAt).Take(AlertsPerSource)
                .Select(a => new { a.Id, a.Description, a.RaisedAt, a.Severity }).ToListAsync(ct);
            all.AddRange(lab.Select(a => (a.RaisedAt, Item(DashboardAlertSource.Lab, a.Id, "Laboratory", a.Description, a.RaisedAt,
                a.Severity == LabAlertSeverity.Critical ? "critical" : a.Severity is LabAlertSeverity.High or LabAlertSeverity.Warning ? "warning" : "info"))));

            var rad = await _radiologyAlertRepository.GetAllNoTracking(a => !a.Acknowledged)
                .OrderByDescending(a => a.RaisedAt).Take(AlertsPerSource)
                .Select(a => new { a.Id, a.Description, a.RaisedAt, a.Severity }).ToListAsync(ct);
            all.AddRange(rad.Select(a => (a.RaisedAt, Item(DashboardAlertSource.Radiology, a.Id, "Radiology", a.Description, a.RaisedAt,
                a.Severity == RadiologyAlertSeverity.Critical ? "critical" : a.Severity is RadiologyAlertSeverity.High or RadiologyAlertSeverity.Warning ? "warning" : "info"))));

            var surgery = await _surgeryAlertRepository.GetAllNoTracking(a => !a.IsAcknowledged)
                .OrderByDescending(a => a.RaisedAt).Take(AlertsPerSource)
                .Select(a => new { a.Id, a.Description, a.RaisedAt, a.Severity }).ToListAsync(ct);
            all.AddRange(surgery.Select(a => (a.RaisedAt, Item(DashboardAlertSource.Surgery, a.Id, "Surgery", a.Description, a.RaisedAt,
                a.Severity == SurgeryAlertSeverity.Critical ? "critical" : a.Severity is SurgeryAlertSeverity.High or SurgeryAlertSeverity.Warning ? "warning" : "info"))));

            var clinical = await _clinicalAlertRepository.GetAllNoTracking(a => !a.IsAcknowledged)
                .OrderByDescending(a => a.RaisedAt).Take(AlertsPerSource)
                .Select(a => new { a.Id, a.Message, a.RaisedAt, a.Severity }).ToListAsync(ct);
            all.AddRange(clinical.Select(a => (a.RaisedAt, Item(DashboardAlertSource.Clinical, a.Id, "Nursing", a.Message, a.RaisedAt,
                a.Severity == ClinicalAlertSeverity.Critical ? "critical" : a.Severity is ClinicalAlertSeverity.High or ClinicalAlertSeverity.Medium ? "warning" : "info"))));

            var inventory = await _inventoryAlertRepository.GetAllNoTracking(a => a.AcknowledgedAt == null)
                .OrderByDescending(a => a.CreatedAt).Take(AlertsPerSource)
                .Select(a => new { a.Id, a.Message, a.CreatedAt, a.Severity }).ToListAsync(ct);
            all.AddRange(inventory.Select(a => (a.CreatedAt, Item(DashboardAlertSource.Inventory, a.Id, "Pharmacy", a.Message, a.CreatedAt,
                a.Severity == InventoryAlertSeverity.Critical ? "critical" : a.Severity is InventoryAlertSeverity.High or InventoryAlertSeverity.Warning ? "warning" : "info"))));

            List<DashboardAlertItemViewModel> ordered = all.OrderByDescending(a => a.At).Select(a => a.Item).ToList();

            return new DashboardAlertsViewModel(
                ordered.Where(a => a.Severity == "critical").ToList(),
                ordered.Where(a => a.Severity == "warning").ToList(),
                ordered.Where(a => a.Severity == "info").ToList()
            );
        }

        private static DashboardAlertItemViewModel Item(string source, Guid id, string department, string message, DateTime at, string severity) =>
            new(DashboardAlertSource.Id(source, id), department, message, Time(at), severity);
    }
}
