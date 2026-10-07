using System.Globalization;
using System.Text;
using PhysioBoo.Application.Commands.Dashboard.DismissDashboardAlert;
using PhysioBoo.Application.Queries.Dashboard.GetOverview;
using PhysioBoo.Application.ViewModels.Dashboard;

namespace PhysioBoo.Presentation.Endpoints
{
    /// <summary>Executive dashboard (overview/dashboard): one aggregated snapshot, alert dismissal and a CSV export.</summary>
    public static class DashboardEndpoints
    {
        public static void MapDashboardEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/dashboard")
                .WithTags("Dashboard")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Overview
            group.MapGet("/overview", async ([FromQuery] string? date, [FromQuery] string? shift, IMediatorHandler bus) =>
            {
                DashboardOverviewViewModel result = await bus.QueryAsync(new GetDashboardOverviewQuery(ParseDate(date), shift));
                return Results.Ok(new ResponseMessage<DashboardOverviewViewModel> { Success = true, Data = result });
            }).WithName("GetDashboardOverview")
            .WithSummary("Operational snapshot for the day (beds, flow, theatres, alerts, finance, appointments, staff).")
            .Produces<ResponseMessage<DashboardOverviewViewModel>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Dashboard.OverviewRead);
            #endregion

            #region Dismiss Alert
            group.MapPost("/alerts/{alertId}/dismiss", async (string alertId, [FromBody] DismissDashboardAlertViewModel? body, IMediatorHandler bus) =>
            {
                await bus.SendCommandAsync(new DismissDashboardAlertCommand(alertId, body?.ResolutionNote));
                return Results.Ok(new ResponseMessage<string> { Success = true, Data = alertId });
            }).WithName("DismissDashboardAlert")
            .WithSummary("Acknowledge an alert in its source module. The id is '{source}:{guid}' from the overview.")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Dashboard.AlertDismiss);
            #endregion

            #region Export
            group.MapPost("/export", async ([FromBody] ExportDashboardViewModel? body, IMediatorHandler bus) =>
            {
                DateOnly? day = ParseDate(body?.Date);
                DashboardOverviewViewModel snapshot = await bus.QueryAsync(new GetDashboardOverviewQuery(day, body?.Shift));
                string name = $"dashboard-{(day ?? DateOnly.FromDateTime(DateTime.Now)):yyyy-MM-dd}.csv";
                return Results.File(BuildCsv(snapshot), "text/csv", name);
            }).WithName("ExportDashboard")
            .WithSummary("Download the day's dashboard figures as CSV.")
            .Produces(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Dashboard.OverviewRead);
            #endregion
        }

        private static DateOnly? ParseDate(string? value) =>
            DateOnly.TryParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateOnly d) ? d : null;

        private static byte[] BuildCsv(DashboardOverviewViewModel s)
        {
            StringBuilder sb = new StringBuilder();
            void Row(string section, string metric, object value) =>
                sb.AppendLine($"{Csv(section)},{Csv(metric)},{Csv(Convert.ToString(value, CultureInfo.InvariantCulture) ?? string.Empty)}");

            sb.AppendLine("Section,Metric,Value");
            Row("Status", "Shift", s.Status.ShiftLabel);
            Row("Status", "ER utilisation %", s.Status.ErUtilizationPct);
            Row("Status", "ICU utilisation %", s.Status.IcuUtilizationPct);
            Row("Status", "Operating rooms in use", $"{s.Status.OrActive}/{s.Status.OrTotal}");
            Row("Status", "Critical alerts", s.Status.CriticalAlertCount);
            Row("Status", "Warning alerts", s.Status.WarningAlertCount);
            Row("Status", "Staff on duty", $"{s.Status.StaffOnDuty}/{s.Status.StaffTotal}");
            Row("Patient flow", "Admissions", s.PatientFlow.AdmissionsToday);
            Row("Patient flow", "Discharges", s.PatientFlow.DischargesToday);
            Row("Patient flow", "Discharges pending", s.PatientFlow.DischargesPending);
            Row("Patient flow", "Average length of stay (days)", s.PatientFlow.AvgLengthOfStayDays);
            Row("Patient flow", "Bed turnover (30 days)", s.PatientFlow.BedTurnoverRate);
            foreach (WardOccupancyViewModel w in s.BedCapacity) Row("Beds", w.Name, $"{w.Occupied}/{w.Total}");
            Row("Finance", "Revenue today", s.Financial.Revenue.Today);
            Row("Finance", "Revenue benchmark", s.Financial.Revenue.Target);
            Row("Finance", "Insurance claims pending", s.Financial.InsuranceClaims.Pending);
            Row("Finance", "Insurance approval rate %", s.Financial.InsuranceClaims.ApprovedPct);
            Row("Pharmacy", "Dispensed today", s.Financial.Pharmacy.DispensedToday);
            Row("Pharmacy", "Low stock alerts", s.Financial.Pharmacy.LowStockCount);
            Row("Laboratory", "Tests pending", s.Financial.Laboratory.OrdersPending);
            Row("Laboratory", "Average turnaround (h)", s.Financial.Laboratory.AvgTurnaroundHours);
            Row("Radiology", "Studies in queue", s.Financial.Radiology.StudiesInQueue);
            Row("Radiology", "Average read time (min)", s.Financial.Radiology.AvgReadMinutes);
            Row("Appointments", "Booked", s.AppointmentFlow.Scheduled);
            Row("Appointments", "Confirmed", s.AppointmentFlow.Confirmed);
            Row("Appointments", "No-shows", s.AppointmentFlow.NoShows);
            Row("Appointments", "Slots remaining", s.AppointmentFlow.SlotsRemaining);
            foreach (DashboardAlertItemViewModel a in s.Alerts.Critical.Concat(s.Alerts.Warning).Concat(s.Alerts.Info))
                Row("Alerts", $"{a.Severity} · {a.Department} · {a.OccurredAt}", a.Message);

            return Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(sb.ToString())).ToArray();
        }

        private static string Csv(string value) =>
            value.Contains(',') || value.Contains('"') || value.Contains('\n') ? $"\"{value.Replace("\"", "\"\"")}\"" : value;
    }
}
