using PhysioBoo.Application.ViewModels.Radiology;

namespace PhysioBoo.Application.Queries.Radiology.GetStudyById
{
    public sealed record GetStudyByIdQuery(Guid Id) : IRequest<StudyRecordViewModel?>;
}
