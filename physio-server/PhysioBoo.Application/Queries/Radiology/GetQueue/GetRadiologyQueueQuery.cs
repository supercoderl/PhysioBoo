using PhysioBoo.Application.ViewModels.Radiology;

namespace PhysioBoo.Application.Queries.Radiology.GetQueue
{
    public sealed record GetRadiologyQueueQuery() : IRequest<List<QueueEntryViewModel>>;
}
