using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.DoctorCertifications.CreateDoctorCertification;
using PhysioBoo.Application.ViewModels.DoctorCertifications;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class DoctorCertificationEndpoints
    {
        public static void MapDoctorCertificationEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/doctor-certifications")
                .WithTags("Doctor Certifications")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Create New Doctor Certification
            group.MapPost("", async (
                [FromBody] CreateDoctorCertificationViewModel newDoctorCertification,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                Guid newId = Guid.NewGuid();

                await bus.SendCommandAsync(new CreateDoctorCertificationCommand(newDoctorCertification, newId));

                return Results.CreatedAtRoute(
                    "GetDoctorCertificationById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newId
                    }
                );
            }).WithName("CreateDoctorCertification")
            .WithSummary("Create new doctor certification")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion
        }
    }
}
