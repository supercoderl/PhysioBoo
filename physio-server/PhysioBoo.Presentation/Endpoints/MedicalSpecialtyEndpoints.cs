using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.MedicalSpecialties.CreateMedicalSpecialty;
using PhysioBoo.Application.Commands.MedicalSpecialties.DeleteMedicalSpecialty;
using PhysioBoo.Application.Commands.MedicalSpecialties.UpdateMedicalSpecialty;
using PhysioBoo.Application.Queries.MedicalSpecialties.GetAll;
using PhysioBoo.Application.Queries.MedicalSpecialties.GetById;
using PhysioBoo.Application.ViewModels.MedicalSpecialties;
using PhysioBoo.Domain.Constants;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class MedicalSpecialtyEndpoints
    {
        public static void MapMedicalSpecialtyEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/medical-specialties")
                .WithTags("Medical Specialties")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Create New Medical Specialty
            group.MapPost("", async (
                [FromBody] CreateMedicalSpecialtyViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                Guid newId = Guid.NewGuid();
                await bus.SendCommandAsync(new CreateMedicalSpecialtyCommand(request, newId));

                return Results.CreatedAtRoute(
                    "GetMedicalSpecialtyById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newId
                    }
                );
            }).WithName("CreateMedicalSpecialty")
            .WithSummary("Create new medical specialty")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Admin.MedicalSpecialtyCreate);
            #endregion

            #region Get All Medical Specialties
            group.MapPost("search", async (
                [FromBody] PagedRequest<MedicalSpecialtyFilter> request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<MedicalSpecialtyViewModel> result = await bus.QueryAsync(new GetAllMedicalSpecialtiesQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<MedicalSpecialtyViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetMedicalSpecialties")
            .WithSummary("Retrieve a paginated list of medical specialties with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<MedicalSpecialtyViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<MedicalSpecialtyViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Admin.MedicalSpecialtyRead);
            #endregion

            #region Delete Medical Specialty
            group.MapDelete("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new DeleteMedicalSpecialtyCommand(id));

                return Results.NoContent();
            }).WithName("DeleteMedicalSpecialty")
            .WithSummary("Handles requests to delete a specific medical specialty by its identifier.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Admin.MedicalSpecialtyDelete);
            #endregion

            #region Update Medical Specialty
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] UpdateMedicalSpecialtyViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpdateMedicalSpecialtyCommand(request, id));

                return Results.NoContent();
            }).WithName("UpdateMedicalSpecialty")
            .WithSummary("Update medical specialty")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Admin.MedicalSpecialtyUpdate);
            #endregion

            #region Get Medical Specialty By Id
            group.MapGet("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                MedicalSpecialtyViewModel? result = await bus.QueryAsync(new GetMedicalSpecialtyByIdQuery(id));

                return Results.Ok(new ResponseMessage<MedicalSpecialtyViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetMedicalSpecialtyById")
            .WithSummary("Retrieve a medical specialty record.")
            .Produces<ResponseMessage<MedicalSpecialtyViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<MedicalSpecialtyViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Admin.MedicalSpecialtyRead);
            #endregion
        }
    }
}
