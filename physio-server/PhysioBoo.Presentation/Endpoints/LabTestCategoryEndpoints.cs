using MediatR;
using PhysioBoo.Application.Commands.LabTestCategories.CreateLabTestCategory;
using PhysioBoo.Application.ViewModels.LabTestCategories;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class LabTestCategoryEndpoints
    {
        public static void MapLabTestCategoryEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/lab-test-categories")
                .WithTags("Lab Test Category")
                .WithOpenApi();

            // Create lab test category
            group.MapPost("/create", async (
                CreateLabTestCategoryViewModel newLabTestCategory,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateLabTestCategoryCommand(newLabTestCategory));

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

                return Results.Created($"/api/lab-test-categories/{newLabTestCategory.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newLabTestCategory.Id
                });
            }).WithName("CreateLabTestCategory")
            .WithSummary("Create new lab test category")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
