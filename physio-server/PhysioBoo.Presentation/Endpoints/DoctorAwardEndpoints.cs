using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.DoctorAwards.CreateDoctorAward;
using PhysioBoo.Application.ViewModels.DoctorAwards;
using PhysioBoo.Domain.Constants;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

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

                return Results.CreatedAtRoute(
                    "GetDoctorAwardById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newDoctorAward.Id
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
