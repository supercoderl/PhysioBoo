using PhysioBoo.Application.Commands.ImagingReports.CreateImagingReport;
using PhysioBoo.Application.ViewModels.ImagingReports;
using PhysioBoo.Domain.Constants;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class ImagingReportEndpoints
    {
        public static void MapImagingReportEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/imaging-reports")
                .WithTags("Imaging Reports")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create imaging report
            group.MapPost("/create", async (
                CreateImagingReportViewModel newImagingReport,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new CreateImagingReportCommand(newImagingReport));

                return Results.Created($"/api/imaging-reports/{newImagingReport.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newImagingReport.Id
                });
            }).WithName("CreateImagingReport")
            .WithSummary("Create new imaging report")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Imaging.ImagingReportCreate);
        }
    }
}
