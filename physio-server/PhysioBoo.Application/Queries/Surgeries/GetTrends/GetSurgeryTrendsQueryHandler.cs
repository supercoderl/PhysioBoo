using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Queries.Surgeries.GetStats;
using PhysioBoo.Application.ViewModels.Surgeries;
using PhysioBoo.Domain.Entities.Theatre;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Surgeries.GetTrends
{
    public sealed class GetSurgeryTrendsQueryHandler : IRequestHandler<GetSurgeryTrendsQuery, SurgeryTrendViewModel>
    {
        private const int TopProcedures = 8;

        private readonly ISurgeryCaseRepository _surgeryRepository;
        private readonly IOperatingRoomRepository _roomRepository;

        public GetSurgeryTrendsQueryHandler(
            ISurgeryCaseRepository surgeryRepository,
            IOperatingRoomRepository roomRepository
        )
        {
            _surgeryRepository = surgeryRepository;
            _roomRepository = roomRepository;
        }

        public async Task<SurgeryTrendViewModel> Handle(GetSurgeryTrendsQuery request, CancellationToken cancellationToken)
        {
            DateTime now = TimeZoneHelper.GetLocalTimeNow();
            SurgeryRange range = SurgeryRange.From(request.Range, now, "week");

            List<SurgeryCase> cases = await _surgeryRepository
                .GetAllNoTracking(c => c.ScheduledStart >= range.Start && c.ScheduledStart < range.End, includeProperties: "Timeline")
                .ToListAsync(cancellationToken);

            List<OperatingRoom> rooms = await _roomRepository
                .GetAllNoTracking(orderBy: q => q.OrderBy(r => r.RoomNumber))
                .ToListAsync(cancellationToken);

            List<SurgeryCase> live = cases.Where(c => c.Status != SurgeryStatus.Cancelled).ToList();
            decimal roomCapacity = (decimal)GetSurgeryStatsQueryHandler.RoomMinutesPerDay * range.Days;

            // One point per day of the range, so quiet days show as zero.
            List<DateTime> days = Enumerable.Range(0, range.Days).Select(i => range.Start.AddDays(i)).ToList();

            return new SurgeryTrendViewModel
            {
                OrUtilizationByRoom = rooms.Select(r => new SurgeryTrendPointViewModel
                {
                    Label = r.RoomNumber,
                    Value = Math.Min(100m, Math.Round(live.Where(c => c.OperatingRoomId == r.Id).Sum(c => (decimal)c.EstimatedDurationMinutes) / roomCapacity * 100m, 1))
                }).ToList(),

                SurgeryVolume = days.Select(d => new SurgeryTrendPointViewModel
                {
                    Label = d.ToString("dd MMM"),
                    Value = live.Count(c => c.ScheduledStart.Date == d)
                }).ToList(),

                DelayRate = Percent(live.Count(c => SurgeryStatusText.IsDelayed(c, now)), live.Count),

                EmergencyCases = days.Select(d => new SurgeryTrendPointViewModel
                {
                    Label = d.ToString("dd MMM"),
                    Value = live.Count(c => c.ScheduledStart.Date == d && c.Priority == SurgeryPriority.Emergency)
                }).ToList(),

                ProcedureDistribution = live
                    .GroupBy(c => c.SurgeryType)
                    .Select(g => new SurgeryTrendPointViewModel { Label = g.Key, Value = g.Count() })
                    .OrderByDescending(p => p.Value)
                    .Take(TopProcedures)
                    .ToList(),

                AverageDuration = days.Select(d => new SurgeryTrendPointViewModel
                {
                    Label = d.ToString("dd MMM"),
                    Value = GetSurgeryStatsQueryHandler.AverageDuration(live.Where(c => c.ScheduledStart.Date == d))
                }).ToList(),

                CancellationRate = Percent(cases.Count(c => c.Status == SurgeryStatus.Cancelled), cases.Count)
            };
        }

        private static decimal Percent(int part, int whole)
        {
            return whole == 0 ? 0 : Math.Round(part * 100m / whole, 1);
        }
    }
}
