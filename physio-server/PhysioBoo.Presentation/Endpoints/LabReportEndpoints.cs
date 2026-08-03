using PhysioBoo.Application.Commands.LabReports.CreateLabReport;
using PhysioBoo.Application.ViewModels.LabReports;
using PhysioBoo.Domain.Constants;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class LabReportEndpoints
    {
        public static void MapLabReportEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/lab-reports")
                .WithTags("Lab Reports")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create lab report
            group.MapPost("/create", async (
                CreateLabReportViewModel newLabReport,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new CreateLabReportCommand(newLabReport));

                return Results.Created($"/api/lab-reports/{newLabReport.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newLabReport.Id
                });
            }).WithName("CreateLabReport")
            .WithSummary("Create new lab report")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Lab.LabReportCreate);
        }
    }
}
