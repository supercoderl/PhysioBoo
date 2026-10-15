
using PhysioBoo.Application.Commands.DoctorAwards.CreateDoctorAward;
using PhysioBoo.Application.ViewModels.DoctorAwards;





namespace PhysioBoo.Presentation.Endpoints
{
    public static class DoctorAwardEndpoints
    {
        public static void MapDoctorAwardEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/doctor-awards")
                .WithTags("Doctor Awards")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Create New Doctor Award
            group.MapPost("", async (
                [FromBody] CreateDoctorAwardViewModel newDoctorAward,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                Guid newId = Guid.NewGuid();

                await bus.SendCommandAsync(new CreateDoctorAwardCommand(newDoctorAward, newId));

                // There is no named single-read route to link to, so the Location is a plain URL.
                return Results.Created(
                    $"/api/doctor-awards/{newId}",
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newId
                    }
                );
            }).WithName("CreateDoctorAward")
            .WithSummary("Create new doctor award")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Hr.DoctorAwardCreate);
            #endregion
        }
    }
}
