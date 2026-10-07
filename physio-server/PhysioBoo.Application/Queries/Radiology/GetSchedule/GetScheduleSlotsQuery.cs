using PhysioBoo.Application.ViewModels.Radiology;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Radiology.GetSchedule
{
    public sealed record GetScheduleSlotsQuery(int PageNumber, int PageSize) : IRequest<PagedResult<ScheduleSlotViewModel>>;
}
