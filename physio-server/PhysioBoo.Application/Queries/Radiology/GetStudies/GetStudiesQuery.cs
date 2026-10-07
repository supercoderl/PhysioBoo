using PhysioBoo.Application.ViewModels.Radiology;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Radiology.GetStudies
{
    public sealed record GetStudiesQuery(int PageNumber, int PageSize) : IRequest<PagedResult<StudyRecordViewModel>>;
}
