using PhysioBoo.Application.Commands.Suppliers.CreateSupplier;
using PhysioBoo.Application.ViewModels.Suppliers;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class SupplierEndpoints
    {
        public static void MapSupplierEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/suppliers")
                .WithTags("Supplier")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create supplier
            group.MapPost("/create", async (
                CreateSupplierViewModel newSupplier,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateSupplierCommand(newSupplier));

                return Results.Created($"/api/suppliers/{newSupplier.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newSupplier.Id
                });
            }).WithName("CreatSupplier")
            .WithSummary("Create new supplier")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
