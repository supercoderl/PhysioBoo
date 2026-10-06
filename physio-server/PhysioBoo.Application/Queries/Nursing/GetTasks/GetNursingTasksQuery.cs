using PhysioBoo.Application.ViewModels.Nursing;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Nursing.GetTasks
{
    public sealed record GetNursingTasksQuery(Guid PatientId, int PageNumber, int PageSize) : IRequest<PagedResult<NursingTaskViewModel>>;
}
