using PhysioBoo.Application.ViewModels.Academy;

namespace PhysioBoo.Application.Queries.Academy.GetCourse
{
    // A draft is returned only when IncludeDrafts is set (the manage endpoint); otherwise it is "not found".
    public sealed record GetCourseQuery(Guid Id, bool IncludeDrafts) : IRequest<CourseViewModel?>;
}
