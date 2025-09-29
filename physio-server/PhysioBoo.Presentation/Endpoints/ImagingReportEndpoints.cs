using MediatR;
using PhysioBoo.Application.Commands.ImagingReports.CreateImagingReport;
using PhysioBoo.Application.ViewModels.ImagingReports;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class ImagingReportEndpoints
    {
        public static void MapImagingReportEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/imaging-reports")
                .WithTags("Imaging Reports")
                .WithOpenApi();

            // Create imaging report
            group.MapPost("/create", async (
                CreateImagingReportViewModel newImagingReport,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateImagingReportCommand(newImagingReport));

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

                return Results.Created($"/api/imaging-reports/{newImagingReport.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newImagingReport.Id
                });
            }).WithName("CreateImagingReport")
            .WithSummary("Create new imaging report")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
