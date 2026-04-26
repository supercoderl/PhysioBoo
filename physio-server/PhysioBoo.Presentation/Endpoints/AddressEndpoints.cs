using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.Addresses.CreateAddress;
using PhysioBoo.Application.Commands.Addresses.DeleteAddress;
using PhysioBoo.Application.Commands.Addresses.UpdateAddress;
using PhysioBoo.Application.Queries.Addresses.GetAll;
using PhysioBoo.Application.Queries.Addresses.GetById;
using PhysioBoo.Application.ViewModels.Addresses;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class AddressEndpoints
    {
        public static void MapAddressEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/addresses")
                .WithTags("Addresses")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Create New Address
            group.MapPost("", async (
                [FromBody] CreateAddressViewModel request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                Guid newId = Guid.NewGuid();
                await bus.SendCommandAsync(new CreateAddressCommand(newId, request));

                return Results.CreatedAtRoute(
                    "GetAddressById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newId
                    }
                );
            }).WithName("CreateAddress")
            .WithSummary("Create New Address")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Get All Addresses
            group.MapPost("search", async (
                [FromBody] PagedRequest<AddressFilter> request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                PagedResult<AddressViewModel> result = await bus.QueryAsync(new GetAllAddressesQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<AddressViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetAddresses")
            .WithSummary("Retrieve a paginated list of addresses with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<AddressViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<AddressViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Delete Address
            group.MapDelete("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new DeleteAddressCommand(id));

                return Results.NoContent();
            }).WithName("DeleteAddress")
            .WithSummary("Handles requests to delete a specific record by its identifier and returns the appropriate result after the operation.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Update Address
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] UpdateAddressViewModel request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new UpdateAddressCommand(request, id));

                return Results.NoContent();
            }).WithName("UpdateAddress")
            .WithSummary("Update address")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .RequireAuthorization();
            #endregion

            #region Get Address By Id
            group.MapGet("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                AddressViewModel? result = await bus.QueryAsync(new GetAddressByIdQuery(id));

                return Results.Ok(new ResponseMessage<AddressViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetAddressById")
            .WithSummary("Retrieve an address record.")
            .Produces<ResponseMessage<AddressViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<AddressViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion
        }
    }
}
