using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.LabTests.CreateLabTest;
using PhysioBoo.Application.Commands.LabTests.DeleteLabTest.Commands.DeleteLabTestCommand;
using PhysioBoo.Application.Commands.LabTests.UpdateLabTest.Commands.UpdateLabTestCommand;
using PhysioBoo.Application.Queries.LabTests.GetAll;
using PhysioBoo.Application.Queries.LabTests.GetById;
using PhysioBoo.Application.ViewModels.LabTests;
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
            group.MapPost("/create", async (
                CreateLabTestViewModel newLabTest,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateLabTestCommand(newLabTest));

                return Results.Created($"/api/lab-tests/{newLabTest.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newLabTest.Id
                });
            }).WithName("CreateLabTest")
            .WithSummary("Create new lab test")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Get All Lab Tests
            group.MapPost("/search", async (
                [FromBody] PagedRequest<LabTestFilter> request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                PagedResult<LabTestViewModel> result = await bus.QueryAsync(new GetAllLabTestsQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<LabTestViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchLabTests")
            .WithSummary("Retrieve a paginated list of lab tests with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<LabTestViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<LabTestViewModel>>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Delete Lab Test
            group.MapPost("/delete", async (
                DeleteLabTestViewModel request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new DeleteLabTestCommand(request.Id, request.IsHard));

                return Results.Ok(new ResponseMessage<string>
                {
                    Success = true,
                    Data = "Lab test has been deleted successfully."
                });
            }).WithName("DeleteLabTest")
            .WithSummary("Handles requests to delete a specific record by its identifier and returns the appropriate result after the operation.")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Update Lab Test
            group.MapPost("/update", async (
                UpdateLabTestViewModel LabTest,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new UpdateLabTestCommand(LabTest));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = LabTest.Id
                });
            }).WithName("UpdateLabTest")
            .WithSummary("Update lab test")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Get Lab Test By Id
            group.MapPost("/search-by-id", async (
                [FromBody] LabTestSingleFilter request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                LabTestViewModel? result = await bus.QueryAsync(new GetLabTestByIdQuery(request.Id));

                return Results.Ok(new ResponseMessage<LabTestViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchLabTest")
            .WithSummary("Retrieve a lab test record.")
            .Produces<ResponseMessage<LabTestViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<LabTestViewModel?>>(StatusCodes.Status400BadRequest);
            #endregion
        }
    }
}
