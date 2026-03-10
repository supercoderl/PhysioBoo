using MediatR;
using PhysioBoo.Application.ViewModels.Sys_SequenceTrackers;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Sys_SequenceTrackers.GetAll
{
    public sealed record GetAllSys_SequenceTrackersQuery(
        PagedRequest<Sys_SequenceTrackerFilter> Request
    ) : IRequest<PagedResult<Sys_SequenceTrackerViewModel>>;
}
