using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.Theatre;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.Queries.Surgeries.SearchCases
{
    public sealed class SurgeriesSearchSpec : Specification<SurgeryCase>
    {
        public SurgeriesSearchSpec(SearchSurgeriesQuery q, DateTime now)
        {
            // Names shown in a row (no lazy loading)
            Query.Include(x => x.Patient!).ThenInclude(p => p.Profile);
            Query.Include(x => x.Department);
            Query.Include(x => x.OperatingRoom);
            Query.Include(x => x.Team).ThenInclude(t => t.StaffUser!).ThenInclude(u => u.Profile);

            if (!string.IsNullOrWhiteSpace(q.Search))
            {
                string pattern = $"%{q.Search.Trim()}%";
                Query.Where(x =>
                    EF.Functions.ILike(x.SurgeryNumber, pattern) ||
                    EF.Functions.ILike(x.Procedure, pattern) ||
                    EF.Functions.ILike(x.Patient!.PatientNumber, pattern) ||
                    EF.Functions.ILike(x.Patient!.Profile!.FirstName, pattern) ||
                    EF.Functions.ILike(x.Patient!.Profile!.LastName, pattern));
            }

            if (!string.IsNullOrWhiteSpace(q.OperatingRoom))
            {
                string room = q.OperatingRoom.Trim();
                Query.Where(x => x.OperatingRoom!.RoomNumber == room);
            }

            if (!string.IsNullOrWhiteSpace(q.Department))
            {
                string pattern = $"%{q.Department.Trim()}%";
                Query.Where(x => x.Department != null && EF.Functions.ILike(x.Department.Name, pattern));
            }

            if (!string.IsNullOrWhiteSpace(q.Surgeon))
            {
                string pattern = $"%{q.Surgeon.Trim()}%";
                Query.Where(x => x.Team.Any(t => t.Role == SurgicalTeamRole.PrimarySurgeon &&
                    (EF.Functions.ILike(t.StaffUser!.Profile!.FirstName, pattern) || EF.Functions.ILike(t.StaffUser!.Profile!.LastName, pattern))));
            }

            if (!string.IsNullOrWhiteSpace(q.Status))
            {
                if (string.Equals(q.Status.Trim(), "Delayed", StringComparison.OrdinalIgnoreCase))
                {
                    // Waiting to start and more than 15 minutes late (same rule as SurgeryStatusText).
                    DateTime cutoff = now.AddMinutes(-15);
                    Query.Where(x => (x.Status == SurgeryStatus.Scheduled || x.Status == SurgeryStatus.PatientArrived || x.Status == SurgeryStatus.PreOpReady)
                                     && x.ScheduledStart < cutoff);
                }
                else if (Enum.TryParse(q.Status, true, out SurgeryStatus status))
                {
                    Query.Where(x => x.Status == status);
                }
            }

            if (!string.IsNullOrWhiteSpace(q.Priority) && Enum.TryParse(q.Priority, true, out SurgeryPriority priority))
            {
                Query.Where(x => x.Priority == priority);
            }

            if (q.EmergencyOnly == true)
            {
                Query.Where(x => x.Priority == SurgeryPriority.Emergency);
            }

            if (q.DateFrom.HasValue)
            {
                DateTime from = q.DateFrom.Value.Date;
                Query.Where(x => x.ScheduledStart >= from);
            }

            if (q.DateTo.HasValue)
            {
                DateTime until = q.DateTo.Value.Date.AddDays(1);
                Query.Where(x => x.ScheduledStart < until);
            }

            Query.OrderBy(x => x.ScheduledStart);
        }
    }
}
