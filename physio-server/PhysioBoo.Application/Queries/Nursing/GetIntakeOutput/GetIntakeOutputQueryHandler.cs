using PhysioBoo.Application.ViewModels.Nursing;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Nursing.GetIntakeOutput
{
    public sealed class GetIntakeOutputQueryHandler : IRequestHandler<GetIntakeOutputQuery, PagedResult<IntakeOutputEntryViewModel>>
    {
        private readonly IIntakeOutputEntryRepository _intakeOutputRepository;

        public GetIntakeOutputQueryHandler(IIntakeOutputEntryRepository intakeOutputRepository)
        {
            _intakeOutputRepository = intakeOutputRepository;
        }

        public async Task<PagedResult<IntakeOutputEntryViewModel>> Handle(GetIntakeOutputQuery request, CancellationToken cancellationToken)
        {
            PagedResult<IntakeOutputEntry> paged = await _intakeOutputRepository.GetPagedAsync(
                request.PageNumber,
                request.PageSize,
                filter: e => e.PatientId == request.PatientId,
                orderBy: q => q.OrderByDescending(e => e.RecordedAt),
                ct: cancellationToken);

            return new PagedResult<IntakeOutputEntryViewModel>(
                paged.TotalCount,
                paged.Items.Select(IntakeOutputEntryViewModel.FromEntity).ToList(),
                request.PageNumber,
                request.PageSize
            );
        }
    }
}
