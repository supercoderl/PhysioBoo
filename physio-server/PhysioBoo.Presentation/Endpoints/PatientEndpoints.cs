using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.Patients.CreatePatient;
using PhysioBoo.Application.Commands.Patients.DeletePatient;
using PhysioBoo.Application.Commands.Patients.UpdatePatient;
using PhysioBoo.Application.Queries.Patients.GetAll;
using PhysioBoo.Application.Queries.Patients.GetById;
using PhysioBoo.Application.ViewModels.Patients;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class PatientEndpoints
    {
        public static void MapPatientEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/patients")
                .WithTags("Patients")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Get All Patients
            group.MapPost("search", async (
                [FromBody] PagedRequest<PatientFilter> request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                PagedResult<PatientViewModel> result = await bus.QueryAsync(new GetAllPatientsQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<PatientViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetPatients")
            .WithSummary("Retrieve a paginated list of patients with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<PatientViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<PatientViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Delete Patient
            group.MapDelete("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new DeletePatientCommand(id));

                return Results.NoContent();
            }).WithName("DeletePatient")
            .WithSummary("Handles requests to delete a specific patient by its identifier.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Create Patient
            group.MapPost("", async (
                [FromBody] CreatePatientViewModel request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                Guid newId = Guid.NewGuid();
                await bus.SendCommandAsync(new CreatePatientCommand(request, newId));

                return Results.CreatedAtRoute(
                "GetPatientById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newId
                    }
                );
            }).WithName("CreatePatient")
            .WithSummary("Create patient")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .RequireAuthorization();
            #endregion

            #region Update Patient
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] UpdatePatientViewModel request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new UpdatePatientCommand(id, request));

                return Results.NoContent();
            }).WithName("UpdatePatient")
            .WithSummary("Update patient")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .RequireAuthorization();
            #endregion

            #region Get Patient By Id
            group.MapGet("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                PatientViewModel? result = await bus.QueryAsync(new GetPatientByIdQuery(id));

                return Results.Ok(new ResponseMessage<PatientViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetPatientById")
            .WithSummary("Retrieve a patient record.")
            .Produces<ResponseMessage<PatientViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PatientViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion
        }
    }
}
