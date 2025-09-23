using MediatR;
using PhysioBoo.Application.Commands.Addresses.CreateAddress;
using PhysioBoo.Application.ViewModels.Addresses;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class AddressEndpoints
    {
        public static void MapAddressEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/addresses")
                .WithTags("Addresses")
                .WithOpenApi();

            // Create address
            group.MapPost("/create", async (
                CreateAddressViewModel newAddress,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                IUser user,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateAddressCommand(newAddress, user.GetUserId()));

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
