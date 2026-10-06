using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Surgeries;
using PhysioBoo.Domain.Entities.Theatre;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Surgeries.GetRooms
{
    public sealed class GetOperatingRoomsQueryHandler : IRequestHandler<GetOperatingRoomsQuery, List<OperatingRoomViewModel>>
    {
        private readonly IOperatingRoomRepository _roomRepository;
        private readonly ISurgeryCaseRepository _surgeryRepository;

        public GetOperatingRoomsQueryHandler(
            IOperatingRoomRepository roomRepository,
            ISurgeryCaseRepository surgeryRepository
        )
        {
            _roomRepository = roomRepository;
            _surgeryRepository = surgeryRepository;
        }

        public async Task<List<OperatingRoomViewModel>> Handle(GetOperatingRoomsQuery request, CancellationToken cancellationToken)
        {
            DateTime now = TimeZoneHelper.GetLocalTimeNow();

            List<OperatingRoom> rooms = await _roomRepository
                .GetAllNoTracking(orderBy: q => q.OrderBy(r => r.RoomNumber))
                .ToListAsync(cancellationToken);

            // The case being operated on in each room right now.
            List<SurgeryCase> active = await _surgeryRepository
                .GetAllNoTracking(
                    c => c.Status == SurgeryStatus.AnesthesiaStarted || c.Status == SurgeryStatus.InProgress,
                    includeProperties: "Patient.Profile,Team.StaffUser.Profile,Timeline")
                .ToListAsync(cancellationToken);

            return rooms.Select(room =>
            {
                SurgeryCase? current = active.FirstOrDefault(c => c.OperatingRoomId == room.Id);
                DateTime? start = current == null
                    ? null
                    : current.Timeline.FirstOrDefault(e => e.Stage == SurgeryTimelineStage.SurgeryStarted)?.OccurredAt ?? current.ScheduledStart;

                return new OperatingRoomViewModel
                {
                    Id = room.Id,
                    RoomNumber = room.RoomNumber,
                    RoomType = room.RoomType,
                    Status = room.Status.ToString(),
                    CurrentSurgeryId = current?.Id,
                    CurrentProcedure = current?.Procedure,
                    SurgeonName = current?.Team.FirstOrDefault(t => t.Role == SurgicalTeamRole.PrimarySurgeon)?.StaffUser?.Profile?.FullName,
                    PatientName = current?.Patient?.Profile?.FullName,
                    StartTime = start,
                    EstimatedFinishTime = current == null ? null
                        : current.EstimatedRemainingMinutes.HasValue ? now.AddMinutes(current.EstimatedRemainingMinutes.Value)
                        : start!.Value.AddMinutes(current.EstimatedDurationMinutes),
                    EquipmentReady = room.EquipmentReady
                };
            }).ToList();
        }
    }
}
