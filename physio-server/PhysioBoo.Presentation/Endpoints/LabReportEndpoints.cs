using MediatR;
using PhysioBoo.Application.Commands.LabReports.CreateLabReport;
using PhysioBoo.Application.ViewModels.LabReports;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class LabReportEndpoints
    {
        public static void MapLabReportEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/lab-reports")
                .WithTags("Lab Reports")
                .WithOpenApi();

            // Create lab report
            group.MapPost("/create", async (
                CreateLabReportViewModel newLabReport,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateLabReportCommand(newLabReport));

                if (notifications.HasNotifications())
                {
                    return Results.BadRequest(new ResponseMessage<Guid>
                    {
                        Success = false,
                        Errors = notifications.GetNotifications().Select(n => n.Value),
                        DetailedErrors = notifications.GetNotifications().Select(n => new DetailedError
                        {
                            Code = n.Code,
                            Data = n.Data
                        })
                    });
                }

                return Results.Created($"/api/lab-reports/{newLabReport.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newLabReport.Id
                });
            }).WithName("CreateLabReport")
            .WithSummary("Create new lab report")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
