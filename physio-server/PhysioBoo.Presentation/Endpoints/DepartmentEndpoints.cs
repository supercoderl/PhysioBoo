using MediatR;
using PhysioBoo.Application.Commands.Departments.CreateDepartment;
using PhysioBoo.Application.ViewModels.Departments;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class DepartmentEndpoints
    {
        public static void MapDepartmentEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/departments")
                .WithTags("Departments")
                .WithOpenApi();

            // Create department
            group.MapPost("/create", async (
                CreateDepartmentViewModel newDepartment,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateDepartmentCommand(newDepartment));

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

                return Results.Created($"/api/departments/{newDepartment.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newDepartment.Id
                });
            }).WithName("CreateDepartment")
            .WithSummary("Create new department")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
