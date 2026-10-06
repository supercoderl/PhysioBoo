using PhysioBoo.Application.ViewModels.Academy;

namespace PhysioBoo.Application.Queries.Academy.GetCourses
{
    // IncludeDrafts is set only by the endpoint that requires the manage permission.
    public sealed record GetCoursesQuery(string? Search, string? Category, bool IncludeDrafts) : IRequest<List<CourseSummaryViewModel>>;
}
