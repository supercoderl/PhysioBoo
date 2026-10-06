using PhysioBoo.Application.ViewModels.Dispensing;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Dispensing.GetQueue
{
    public sealed record GetDispenseQueueQuery(string? Search, string? Status) : IRequest<PagedResult<DispenseQueueItemViewModel>>;
}
