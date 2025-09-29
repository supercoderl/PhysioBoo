using MediatR;
using PhysioBoo.Application.Commands.LabTests.CreateLabTest;
using PhysioBoo.Application.ViewModels.LabTests;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class LabTestEndpoints
    {
        public static void MapLabTestEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/lab-tests")
                .WithTags("Lab Tests")
                .WithOpenApi();

            // Create lab test
            group.MapPost("/create", async (
                CreateLabTestViewModel newLabTest,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateLabTestCommand(newLabTest));

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

                return Results.Created($"/api/lab-tests/{newLabTest.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newLabTest.Id
                });
            }).WithName("CreateLabTest")
            .WithSummary("Create new lab test")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
