using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Radiology;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Radiology.GetSchedule
{
    public sealed class GetScheduleSlotsQueryHandler : IRequestHandler<GetScheduleSlotsQuery, PagedResult<ScheduleSlotViewModel>>
    {
        private readonly IImagingOrderRepository _imagingOrderRepository;

        public GetScheduleSlotsQueryHandler(IImagingOrderRepository imagingOrderRepository)
        {
            _imagingOrderRepository = imagingOrderRepository;
        }

        public async Task<PagedResult<ScheduleSlotViewModel>> Handle(GetScheduleSlotsQuery request, CancellationToken ct)
        {
            // Booked, not-yet-imaged exams from today onwards.
            DateOnly today = DateOnly.FromDateTime(TimeZoneHelper.GetLocalTimeNow());

            IQueryable<ImagingOrder> query = _imagingOrderRepository
                .GetAllNoTracking(
                    o => o.ScheduledDate != null && o.ScheduledDate >= today &&
                         (o.Status == ImagingOrderStatus.Scheduled || o.Status == ImagingOrderStatus.Arrived),
                    includeProperties: "Patient.Profile,Modality,Technician.Profile")
                .OrderBy(o => o.ScheduledDate)
                .ThenBy(o => o.ScheduledTime);

            int total = await query.CountAsync(ct);
            List<ImagingOrder> orders = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(ct);

            return new PagedResult<ScheduleSlotViewModel>(total, orders.Select(RadiologyWorkspace.ToSlot).ToList(), request.PageNumber, request.PageSize);
        }
    }
}
