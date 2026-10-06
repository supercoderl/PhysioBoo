using PhysioBoo.Application.ViewModels.Nursing;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Nursing.GetTasks
{
    public sealed class GetNursingTasksQueryHandler : IRequestHandler<GetNursingTasksQuery, PagedResult<NursingTaskViewModel>>
    {
        private readonly INursingTaskRepository _taskRepository;

        public GetNursingTasksQueryHandler(INursingTaskRepository taskRepository)
        {
            _taskRepository = taskRepository;
        }

        public async Task<PagedResult<NursingTaskViewModel>> Handle(GetNursingTasksQuery request, CancellationToken cancellationToken)
        {
            DateTime now = TimeZoneHelper.GetLocalTimeNow();

            PagedResult<NursingTask> paged = await _taskRepository.GetPagedAsync(
                request.PageNumber,
                request.PageSize,
                filter: t => t.PatientId == request.PatientId,
                orderBy: q => q.OrderBy(t => t.DueAt),
                ct: cancellationToken);

            return new PagedResult<NursingTaskViewModel>(
                paged.TotalCount,
                paged.Items.Select(t => NursingTaskViewModel.FromEntity(t, now)).ToList(),
                request.PageNumber,
                request.PageSize
            );
        }
    }
}
