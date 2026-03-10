using MediatR;
using PhysioBoo.Application.ViewModels.Sys_SequenceTrackers;

namespace PhysioBoo.Application.Queries.Sys_SequenceTrackers.GetById
{
    public sealed record GetSys_SequenceTrackerByIdQuery(Guid Id) : IRequest<Sys_SequenceTrackerViewModel?>;
}
