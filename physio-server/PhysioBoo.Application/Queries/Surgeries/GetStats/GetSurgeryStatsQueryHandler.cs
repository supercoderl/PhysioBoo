using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Surgeries;
using PhysioBoo.Domain.Entities.Theatre;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Surgeries.GetStats
{
    public sealed class GetSurgeryStatsQueryHandler : IRequestHandler<GetSurgeryStatsQuery, SurgeryStatsViewModel>
    {
        // A room is bookable for an 8-hour theatre day.
        internal const int RoomMinutesPerDay = 480;

        private readonly ISurgeryCaseRepository _surgeryRepository;
        private readonly IOperatingRoomRepository _roomRepository;

        public GetSurgeryStatsQueryHandler(
            ISurgeryCaseRepository surgeryRepository,
            IOperatingRoomRepository roomRepository
        )
        {
            _surgeryRepository = surgeryRepository;
            _roomRepository = roomRepository;
        }

        public async Task<SurgeryStatsViewModel> Handle(GetSurgeryStatsQuery request, CancellationToken cancellationToken)
        {
            DateTime now = TimeZoneHelper.GetLocalTimeNow();
            SurgeryRange range = SurgeryRange.From(request.Range, now, "today");

            List<SurgeryCase> cases = await _surgeryRepository
                .GetAllNoTracking(c => c.ScheduledStart >= range.Start && c.ScheduledStart < range.End, includeProperties: "Timeline")
                .ToListAsync(cancellationToken);

            List<OperatingRoom> rooms = await _roomRepository.GetAllNoTracking().ToListAsync(cancellationToken);

            List<SurgeryCase> live = cases.Where(c => c.Status != SurgeryStatus.Cancelled).ToList();
            int bookable = rooms.Count(r => r.Status != OperatingRoomStatus.Closed && r.Status != OperatingRoomStatus.Maintenance);
            decimal capacity = (decimal)bookable * RoomMinutesPerDay * range.Days;
            decimal booked = live.Sum(c => c.EstimatedDurationMinutes);

            return new SurgeryStatsViewModel
            {
                TotalScheduled = live.Count,
                Ongoing = live.Count(c => c.Status is SurgeryStatus.AnesthesiaStarted or SurgeryStatus.InProgress),
                Completed = live.Count(c => c.Status is SurgeryStatus.ProcedureCompleted or SurgeryStatus.Recovery or SurgeryStatus.Discharged),
                Delayed = live.Count(c => SurgeryStatusText.IsDelayed(c, now)),
                Emergency = live.Count(c => c.Priority == SurgeryPriority.Emergency),
                AvailableRooms = rooms.Count(r => r.Status == OperatingRoomStatus.Available),
                OccupiedRooms = rooms.Count(r => r.Status == OperatingRoomStatus.InSurgery),
                AverageDurationMinutes = AverageDuration(live),
                OrUtilizationRate = capacity == 0 ? 0 : Math.Min(100m, Math.Round(booked / capacity * 100m, 1))
            };
        }

        // Real duration (surgery started to procedure completed) where recorded; otherwise the estimate.
        internal static int AverageDuration(IEnumerable<SurgeryCase> cases)
        {
            List<double> minutes = cases
                .Select(ActualMinutes)
                .Where(m => m.HasValue)
                .Select(m => m!.Value)
                .ToList();

            return minutes.Count == 0 ? 0 : (int)Math.Round(minutes.Average());
        }

        internal static double? ActualMinutes(SurgeryCase surgery)
        {
            DateTime? started = surgery.Timeline.FirstOrDefault(e => e.Stage == SurgeryTimelineStage.SurgeryStarted)?.OccurredAt;
            DateTime? finished = surgery.Timeline.FirstOrDefault(e => e.Stage == SurgeryTimelineStage.ProcedureCompleted)?.OccurredAt;

            return started.HasValue && finished.HasValue && finished >= started
                ? (finished.Value - started.Value).TotalMinutes
                : null;
        }
    }
}
