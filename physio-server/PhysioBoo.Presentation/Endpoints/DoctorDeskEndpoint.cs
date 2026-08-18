using PhysioBoo.Application.Queries.DoctorDesks.GetSnapshot;
using PhysioBoo.Application.ViewModels.DoctorDesks;
using PhysioBoo.Domain.Constants;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class DoctorDeskEndpoints
    {
        public static void MapDoctorDeskEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/doctor-desk")
                .WithTags("Doctor Desk")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            group.MapGet("snapshot", async (
                IMediatorHandler bus,
                IUser user,
                CancellationToken ct) =>
            {
                DoctorDeskSnapshotViewModel result = await bus.QueryAsync(new GetDoctorDeskSnapshotQuery(user.GetUserId()));

                return Results.Ok(new ResponseMessage<DoctorDeskSnapshotViewModel?>
                {
                    Success = true,
                    Data = result
                });
            })
            .WithName("GetDoctorDeskSnapshot")
            .RequireAuthorization(Permissions.Clinical.DoctorDeskRead);
        }
    }
}
