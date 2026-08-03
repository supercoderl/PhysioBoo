using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.LabTests.CreateLabTest;
using PhysioBoo.Application.Commands.LabTests.DeleteLabTest.Commands.DeleteLabTestCommand;
using PhysioBoo.Application.Commands.LabTests.UpdateLabTest.Commands.UpdateLabTestCommand;
using PhysioBoo.Application.Queries.LabTests.GetAll;
using PhysioBoo.Application.Queries.LabTests.GetById;
using PhysioBoo.Application.ViewModels.LabTests;
using PhysioBoo.Domain.Constants;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class LabTestEndpoints
    {
        public static void MapLabTestEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/lab-tests")
                .WithTags("Lab Tests")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Create New Lab Test
            group.MapPost("", async (
                [FromBody] CreateLabTestViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                Guid newId = Guid.NewGuid();
                await bus.SendCommandAsync(new CreateLabTestCommand(request, newId));

                return Results.CreatedAtRoute(
                    "GetLabTestById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newId
                    }
                );
            }).WithName("CreateLabTest")
            .WithSummary("Create new lab test")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Lab.LabTestCreate);
            #endregion

            #region Get All Lab Tests
            group.MapPost("search", async (
                [FromBody] PagedRequest<LabTestFilter> request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<LabTestViewModel> result = await bus.QueryAsync(new GetAllLabTestsQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<LabTestViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetLabTests")
            .WithSummary("Retrieve a paginated list of lab tests with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<LabTestViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<LabTestViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Lab.LabTestRead);
            #endregion

            #region Delete Lab Test
            group.MapDelete("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new DeleteLabTestCommand(id));

                return Results.NoContent();
            }).WithName("DeleteLabTest")
            .WithSummary("Handles requests to delete a specific lab test by its identifier.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Lab.LabTestDelete);
            #endregion

            #region Update Lab Test
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] UpdateLabTestViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpdateLabTestCommand(request, id));

                return Results.NoContent();
            }).WithName("UpdateLabTest")
            .WithSummary("Update lab test")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Lab.LabTestUpdate);
            #endregion

            #region Get Lab Test By Id
            group.MapGet("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                LabTestViewModel? result = await bus.QueryAsync(new GetLabTestByIdQuery(id));

                return Results.Ok(new ResponseMessage<LabTestViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetLabTestById")
            .WithSummary("Retrieve a lab test record.")
            .Produces<ResponseMessage<LabTestViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<LabTestViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Lab.LabTestRead);
            #endregion
        }
    }
}
