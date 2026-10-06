using PhysioBoo.Application.Commands.Academy.CreateCourse;
using PhysioBoo.Application.Commands.Academy.CreateLesson;
using PhysioBoo.Application.Commands.Academy.DeleteCourse;
using PhysioBoo.Application.Commands.Academy.DeleteLesson;
using PhysioBoo.Application.Commands.Academy.SetLessonCompletion;
using PhysioBoo.Application.Commands.Academy.UpdateCourse;
using PhysioBoo.Application.Commands.Academy.UpdateLesson;
using PhysioBoo.Application.Queries.Academy.GetCourse;
using PhysioBoo.Application.Queries.Academy.GetCourses;
using PhysioBoo.Application.ViewModels.Academy;

namespace PhysioBoo.Presentation.Endpoints
{
    // Reading and learning need a login only; creating and changing content needs academy:course:manage.
    public static class AcademyEndpoints
    {
        public static void MapAcademyEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/academy")
                .WithTags("Academy")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Learner
            group.MapGet("/courses", async (
                [FromQuery] string? search,
                [FromQuery] string? category,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                List<CourseSummaryViewModel> result = await bus.QueryAsync(new GetCoursesQuery(search, category, false));

                return Results.Ok(new ResponseMessage<List<CourseSummaryViewModel>> { Success = true, Data = result });
            }).WithName("GetAcademyCourses")
            .WithSummary("Published courses with the signed-in user's progress.")
            .Produces<ResponseMessage<List<CourseSummaryViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization();

            group.MapGet("/courses/{id:guid}", async (Guid id, IMediatorHandler bus, CancellationToken ct) =>
            {
                CourseViewModel? result = await bus.QueryAsync(new GetCourseQuery(id, false));

                return Results.Ok(new ResponseMessage<CourseViewModel?> { Success = true, Data = result });
            }).WithName("GetAcademyCourse")
            .WithSummary("A published course with its lessons and which of them the user has finished.")
            .Produces<ResponseMessage<CourseViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<CourseViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization();

            group.MapPost("/lessons/{id:guid}/complete", async (Guid id, IMediatorHandler bus, CancellationToken ct) =>
            {
                await bus.SendCommandAsync(new SetLessonCompletionCommand(id, true));

                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).WithName("CompleteAcademyLesson")
            .WithSummary("Mark a lesson as finished by the signed-in user. Repeating it is harmless.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization();

            group.MapDelete("/lessons/{id:guid}/complete", async (Guid id, IMediatorHandler bus, CancellationToken ct) =>
            {
                await bus.SendCommandAsync(new SetLessonCompletionCommand(id, false));

                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).WithName("UncompleteAcademyLesson")
            .WithSummary("Mark a lesson as not finished.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization();
            #endregion

            #region Manage
            group.MapGet("/courses/manage", async (
                [FromQuery] string? search,
                [FromQuery] string? category,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                List<CourseSummaryViewModel> result = await bus.QueryAsync(new GetCoursesQuery(search, category, true));

                return Results.Ok(new ResponseMessage<List<CourseSummaryViewModel>> { Success = true, Data = result });
            }).WithName("GetAcademyCoursesManage")
            .WithSummary("Every course including drafts.")
            .Produces<ResponseMessage<List<CourseSummaryViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Academy.CourseManage);

            group.MapGet("/courses/{id:guid}/manage", async (Guid id, IMediatorHandler bus, CancellationToken ct) =>
            {
                CourseViewModel? result = await bus.QueryAsync(new GetCourseQuery(id, true));

                return Results.Ok(new ResponseMessage<CourseViewModel?> { Success = true, Data = result });
            }).WithName("GetAcademyCourseManage")
            .WithSummary("A course including a draft one.")
            .Produces<ResponseMessage<CourseViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<CourseViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Academy.CourseManage);

            group.MapPost("/courses", async ([FromBody] SaveCourseViewModel request, IMediatorHandler bus, CancellationToken ct) =>
            {
                CreateCourseCommand command = new(Guid.NewGuid(), request);

                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<CourseSummaryViewModel?> { Success = true, Data = command.Result });
            }).WithName("CreateAcademyCourse")
            .WithSummary("Create a course.")
            .Produces<ResponseMessage<CourseSummaryViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<CourseSummaryViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Academy.CourseManage);

            group.MapPut("/courses/{id:guid}", async (Guid id, [FromBody] SaveCourseViewModel request, IMediatorHandler bus, CancellationToken ct) =>
            {
                await bus.SendCommandAsync(new UpdateCourseCommand(id, request));

                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).WithName("UpdateAcademyCourse")
            .WithSummary("Change a course; set isPublished to publish or unpublish it.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Academy.CourseManage);

            group.MapDelete("/courses/{id:guid}", async (Guid id, IMediatorHandler bus, CancellationToken ct) =>
            {
                await bus.SendCommandAsync(new DeleteCourseCommand(id));

                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).WithName("DeleteAcademyCourse")
            .WithSummary("Delete a course.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Academy.CourseManage);

            group.MapPost("/courses/{courseId:guid}/lessons", async (Guid courseId, [FromBody] SaveLessonViewModel request, IMediatorHandler bus, CancellationToken ct) =>
            {
                CreateLessonCommand command = new(Guid.NewGuid(), courseId, request);

                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<LessonViewModel?> { Success = true, Data = command.Result });
            }).WithName("CreateAcademyLesson")
            .WithSummary("Add a lesson at the end of a course.")
            .Produces<ResponseMessage<LessonViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<LessonViewModel?>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<LessonViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Academy.CourseManage);

            group.MapPut("/lessons/{id:guid}", async (Guid id, [FromBody] SaveLessonViewModel request, IMediatorHandler bus, CancellationToken ct) =>
            {
                UpdateLessonCommand command = new(id, request);

                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<LessonViewModel?> { Success = true, Data = command.Result });
            }).WithName("UpdateAcademyLesson")
            .WithSummary("Change a lesson's title, content or duration.")
            .Produces<ResponseMessage<LessonViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<LessonViewModel?>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<LessonViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Academy.CourseManage);

            group.MapDelete("/lessons/{id:guid}", async (Guid id, IMediatorHandler bus, CancellationToken ct) =>
            {
                await bus.SendCommandAsync(new DeleteLessonCommand(id));

                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).WithName("DeleteAcademyLesson")
            .WithSummary("Delete a lesson.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Academy.CourseManage);
            #endregion
        }
    }
}
