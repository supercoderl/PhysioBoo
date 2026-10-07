using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Dashboard;
using PhysioBoo.Domain.Entities.Theatre;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.Queries.Dashboard.GetOverview
{
    public sealed partial class GetDashboardOverviewQueryHandler
    {
        private async Task<List<WardOccupancyViewModel>> GetBedCapacityAsync(CancellationToken ct)
        {
            var beds = await _bedRepository
                .GetAllNoTracking(b => b.Status != BedStatus.Maintenance)
                .Select(b => new { WardName = b.Ward!.Name, b.Status })
                .ToListAsync(ct);

            return beds
                .GroupBy(b => b.WardName ?? "Unassigned")
                .Select(g => new WardOccupancyViewModel(g.Key, g.Count(b => b.Status == BedStatus.Occupied), g.Count()))
                .OrderBy(w => w.Name)
                .ToList();
        }

        /// <summary>Bed occupancy per department (through the ward's department), busiest first.</summary>
        private async Task<List<DepartmentLoadViewModel>> GetDepartmentLoadAsync(CancellationToken ct)
        {
            var beds = await _bedRepository
                .GetAllNoTracking(b => b.Status != BedStatus.Maintenance)
                .Select(b => new { Department = b.Ward!.Department!.Name, WardName = b.Ward.Name, b.Status })
                .ToListAsync(ct);

            return beds
                .GroupBy(b => b.Department ?? b.WardName ?? "Unassigned")
                .Select(g =>
                {
                    double pct = Pct(g.Count(b => b.Status == BedStatus.Occupied), g.Count());
                    return new DepartmentLoadViewModel(g.Key, pct, pct >= CriticalUtilizationPct);
                })
                .OrderByDescending(d => d.UtilizationPct)
                .Take(8)
                .ToList();
        }

        private async Task<PatientFlowSummaryViewModel> GetPatientFlowAsync(DateTime dayStart, DateTime dayEnd, CancellationToken ct)
        {
            DateTime yesterday = dayStart.AddDays(-1);
            DateTime monthAgo = dayStart.AddDays(-30);
            DateTime twoMonthsAgo = dayStart.AddDays(-60);

            List<DateTime> admitted = await _admissionRepository
                .GetAllNoTracking(a => a.AdmittedAt >= yesterday && a.AdmittedAt < dayEnd && a.Status != AdmissionRecordStatus.Cancelled)
                .Select(a => a.AdmittedAt)
                .ToListAsync(ct);

            var discharged = await _admissionRepository
                .GetAllNoTracking(a => a.DischargedAt >= twoMonthsAgo && a.DischargedAt < dayEnd)
                .Select(a => new { a.AdmittedAt, DischargedAt = a.DischargedAt!.Value })
                .ToListAsync(ct);

            int dischargesPending = await _bedAssignmentRepository
                .GetAllNoTracking(b => b.DischargedAt == null && b.ExpectedDischargeDate != null && b.ExpectedDischargeDate < dayEnd)
                .CountAsync(ct);

            int totalBeds = await _bedRepository.GetAllNoTracking(b => b.Status != BedStatus.Maintenance).CountAsync(ct);

            List<DateTime> admittedToday = admitted.Where(a => a >= dayStart).ToList();
            List<DateTime> dischargedToday = discharged.Where(d => d.DischargedAt >= dayStart).Select(d => d.DischargedAt).ToList();
            var lastMonth = discharged.Where(d => d.DischargedAt >= monthAgo && d.DischargedAt < dayStart).ToList();
            int previousMonth = discharged.Count(d => d.DischargedAt >= twoMonthsAgo && d.DischargedAt < monthAgo);

            double avgStay = lastMonth.Count == 0 ? 0 : Math.Round(lastMonth.Average(d => (d.DischargedAt - d.AdmittedAt).TotalDays), 1);

            // Bed turnover = discharges per bed over the last 30 days.
            double turnover = totalBeds == 0 ? 0 : Math.Round(lastMonth.Count / (double)totalBeds, 1);
            double previousTurnover = totalBeds == 0 ? 0 : previousMonth / (double)totalBeds;

            List<PatientFlowHourlyPointViewModel> hourly = Enumerable.Range(0, 24)
                .Select(h => new PatientFlowHourlyPointViewModel(
                    $"{h:00}:00",
                    admittedToday.Count(a => a.Hour == h),
                    dischargedToday.Count(d => d.Hour == h)))
                .ToList();

            return new PatientFlowSummaryViewModel(
                admittedToday.Count,
                ChangePct(admittedToday.Count, admitted.Count(a => a < dayStart)),
                dischargedToday.Count,
                dischargesPending,
                avgStay,
                turnover,
                ChangePct(turnover, previousTurnover),
                hourly
            );
        }

        private async Task<(int Active, int Total)> GetOperatingRoomUseAsync(CancellationToken ct)
        {
            var rooms = await _operatingRoomRepository
                .GetAllNoTracking(r => r.Status != OperatingRoomStatus.Closed)
                .Select(r => r.Status)
                .ToListAsync(ct);

            return (rooms.Count(s => s == OperatingRoomStatus.InSurgery), rooms.Count);
        }

        /// <summary>Today's cases that are under way or closing, then the next scheduled ones (up to six rows).</summary>
        private async Task<List<OperationTheatreViewModel>> GetActiveOperationsAsync(DateTime dayStart, DateTime dayEnd, DateTime now, CancellationToken ct)
        {
            SurgeryStatus[] live =
            {
                SurgeryStatus.PatientArrived, SurgeryStatus.PreOpReady, SurgeryStatus.AnesthesiaStarted,
                SurgeryStatus.InProgress, SurgeryStatus.ProcedureCompleted, SurgeryStatus.Scheduled
            };

            List<SurgeryCase> cases = await _surgeryCaseRepository
                .GetAllNoTracking(
                    c => c.ScheduledStart >= dayStart && c.ScheduledStart < dayEnd && live.Contains(c.Status),
                    includeProperties: "OperatingRoom,Team.StaffUser.Profile,Timeline")
                .AsSplitQuery()
                .ToListAsync(ct);

            return cases
                .Select(c =>
                {
                    string status = c.Status switch
                    {
                        SurgeryStatus.ProcedureCompleted => "closing",
                        SurgeryStatus.Scheduled or SurgeryStatus.PatientArrived or SurgeryStatus.PreOpReady => "scheduled",
                        _ => "ongoing"
                    };

                    DateTime started = c.Timeline
                        .Where(t => t.Stage is SurgeryTimelineStage.AnesthesiaStarted or SurgeryTimelineStage.SurgeryStarted)
                        .Select(t => (DateTime?)t.OccurredAt)
                        .Min() ?? c.ScheduledStart;

                    int duration = Math.Max(1, c.EstimatedDurationMinutes);
                    int elapsed = status == "scheduled" ? 0 : (int)Math.Max(0, (now - started).TotalMinutes);
                    int remaining = c.EstimatedRemainingMinutes ?? Math.Max(0, duration - elapsed);
                    int progress = status switch
                    {
                        "scheduled" => 0,
                        "closing" => Math.Max(90, Math.Min(99, elapsed * 100 / duration)),
                        _ => Math.Min(95, elapsed * 100 / duration)
                    };

                    string surgeon = c.Team
                        .Where(m => m.Role == SurgicalTeamRole.PrimarySurgeon)
                        .Select(m => m.StaffUser?.Profile?.FullName)
                        .FirstOrDefault(n => !string.IsNullOrEmpty(n)) ?? "Unassigned";

                    return new { Order = status == "scheduled" ? 1 : 0, Start = started, Row = new OperationTheatreViewModel(
                        c.OperatingRoom?.RoomNumber ?? "OR",
                        c.Procedure,
                        surgeon,
                        Time(started),
                        remaining,
                        status,
                        progress) };
                })
                .OrderBy(x => x.Order)
                .ThenBy(x => x.Start)
                .Take(6)
                .Select(x => x.Row)
                .ToList();
        }
    }
}
