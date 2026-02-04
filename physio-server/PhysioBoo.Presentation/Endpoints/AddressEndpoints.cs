using PhysioBoo.Application.Commands.Addresses.CreateAddress;
using PhysioBoo.Application.ViewModels.Addresses;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

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

            // Create address
            group.MapPost("/create", async (
                CreateAddressViewModel newAddress,
                IMediatorHandler bus,
                IUser user,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateAddressCommand(newAddress, user.GetUserId()));

                return Results.Created($"/api/addresses/create/{newAddress.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newAddress.Id
                });
            }).WithName("CreateAddress")
            .WithSummary("Create new address")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
        }
    }
}
