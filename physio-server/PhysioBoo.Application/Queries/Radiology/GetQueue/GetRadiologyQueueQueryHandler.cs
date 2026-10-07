using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Radiology;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Radiology.GetQueue
{
    public sealed class GetRadiologyQueueQueryHandler : IRequestHandler<GetRadiologyQueueQuery, List<QueueEntryViewModel>>
    {
        private readonly IImagingOrderRepository _imagingOrderRepository;

        public GetRadiologyQueueQueryHandler(IImagingOrderRepository imagingOrderRepository)
        {
            _imagingOrderRepository = imagingOrderRepository;
        }

        public async Task<List<QueueEntryViewModel>> Handle(GetRadiologyQueueQuery request, CancellationToken ct)
        {
            // Today's board: everything booked for today, plus anyone already called or being imaged.
            DateTime now = TimeZoneHelper.GetLocalTimeNow();
            DateOnly today = DateOnly.FromDateTime(now);

            List<ImagingOrder> orders = await _imagingOrderRepository
                .GetAllNoTracking(
                    o => o.ScheduledDate == today ||
                         o.QueueStatus == RadiologyQueueStatus.Called ||
                         o.QueueStatus == RadiologyQueueStatus.InProgress,
                    includeProperties: "Patient.Profile,Modality")
                .ToListAsync(ct);

            // Stat first, then urgent, then by booked time.
            return orders
                .OrderBy(o => o.LabPriority switch
                {
                    LabPriority.Stat or LabPriority.Emergency => 0,
                    LabPriority.Urgent => 1,
                    _ => 2
                })
                .ThenBy(o => o.ScheduledTime)
                .Select(RadiologyWorkspace.ToQueueEntry)
                .ToList();
        }
    }
}
