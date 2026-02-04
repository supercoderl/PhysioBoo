using PhysioBoo.Application.Commands.HospitalGroups.CreateHospitalGroup;
using PhysioBoo.Application.ViewModels.HospitalGroups;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class HospitalGroupEndpoints
    {
        public static void MapHospitalGroupEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/hospital-groups")
                .WithTags("Hospital Groups")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create hospital group
            group.MapPost("/create", async (
                CreateHospitalGroupViewModel newHospitalGroup,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateHospitalGroupCommand(newHospitalGroup));

                return Results.Created($"/api/hospital-groups/{newHospitalGroup.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newHospitalGroup.Id
                });
            }).WithName("CreateHospitalGroup")
            .WithSummary("Create new hospital group")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
