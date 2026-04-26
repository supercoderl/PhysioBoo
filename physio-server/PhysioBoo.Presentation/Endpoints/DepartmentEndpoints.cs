using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.Departments.CreateDepartment;
using PhysioBoo.Application.Commands.Departments.DeleteDepartment;
using PhysioBoo.Application.Commands.Departments.UpdateDepartment;
using PhysioBoo.Application.Queries.Departments.GetAll;
using PhysioBoo.Application.Queries.Departments.GetById;
using PhysioBoo.Application.ViewModels.Departments;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;
using PhysioBoo.SharedKernel.Common;

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

            #region Create New Department
            group.MapPost("", async (
                [FromBody] CreateDepartmentViewModel newDepartment,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                Guid newId = Guid.NewGuid();

                await bus.SendCommandAsync(new CreateDepartmentCommand(newDepartment, newId));

                return Results.CreatedAtRoute(
                    "GetDepartmentById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newDepartment.Id
                    }
                );
            }).WithName("CreateDepartment")
            .WithSummary("Create new department")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Get All Departments
            group.MapPost("/search", async (
                [FromBody] PagedRequest<DepartmentFilter> request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                PagedResult<DepartmentViewModel> result = await bus.QueryAsync(new GetAllDepartmentsQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<DepartmentViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchDepartments")
            .WithSummary("Retrieve a paginated list of departments with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<DepartmentViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<DepartmentViewModel>>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Delete Department
            group.MapDelete("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new DeleteDepartmentCommand(id));

                return Results.NoContent();
            }).WithName("DeleteDepartment")
            .WithSummary("Handles requests to delete a specific record by its identifier and returns the appropriate result after the operation.")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .RequireAuthorization();
            #endregion

            #region Update Department
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] UpdateDepartmentViewModel department,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new UpdateDepartmentCommand(department, id));

                return Results.NoContent();
            }).WithName("UpdateDepartment")
            .WithSummary("Update department")
            .Produces(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .RequireAuthorization();
            #endregion

            #region Get Department By Id
            group.MapGet("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                DepartmentViewModel? result = await bus.QueryAsync(new GetDepartmentByIdQuery(id));

                return Results.Ok(new ResponseMessage<DepartmentViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetDepartmentById")
            .WithSummary("Retrieve a department record.")
            .Produces<ResponseMessage<DepartmentViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<DepartmentViewModel?>>(StatusCodes.Status400BadRequest);
            #endregion
        }
    }
}
