using PhysioBoo.Application.Commands.Departments.CreateDepartment;
using PhysioBoo.Application.ViewModels.Departments;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class DepartmentEndpoints
    {
        public static void MapDepartmentEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/departments")
                .WithTags("Departments")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create department
            group.MapPost("/create", async (
                CreateDepartmentViewModel newDepartment,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateDepartmentCommand(newDepartment));

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
