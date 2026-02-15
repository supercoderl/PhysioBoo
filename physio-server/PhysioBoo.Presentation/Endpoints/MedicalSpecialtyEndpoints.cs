using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.MedicalSpecialties.CreateMedicalSpecialty;
using PhysioBoo.Application.Commands.MedicalSpecialties.DeleteMedicalSpecialty;
using PhysioBoo.Application.Commands.MedicalSpecialties.UpdateMedicalSpecialty;
using PhysioBoo.Application.Queries.MedicalSpecialties.GetAll;
using PhysioBoo.Application.Queries.MedicalSpecialties.GetById;
using PhysioBoo.Application.ViewModels.MedicalSpecialties;
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
            group.MapPost("/create", async (
                CreateMedicalSpecialtyViewModel newMedicalSpecialty,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateMedicalSpecialtyCommand(newMedicalSpecialty));

                return Results.Created($"/api/medical-specialty/{newMedicalSpecialty.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newMedicalSpecialty.Id
                });
            }).WithName("CreateMedicalSpecialty")
            .WithSummary("Create new medical specialty")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Get All Medical Specialties
            group.MapPost("/search", async (
                [FromBody] PagedRequest<MedicalSpecialtyFilter> request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                PagedResult<MedicalSpecialtyViewModel> result = await bus.QueryAsync(new GetAllMedicalSpecialtiesQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<MedicalSpecialtyViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchMedicalSpecialties")
            .WithSummary("Retrieve a paginated list of medical specialties with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<MedicalSpecialtyViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<MedicalSpecialtyViewModel>>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Delete Medical Specialty
            group.MapPost("/delete", async (
                DeleteMedicalSpecialtyViewModel request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new DeleteMedicalSpecialtyCommand(request.Id, request.IsHard));

                return Results.Ok(new ResponseMessage<string>
                {
                    Success = true,
                    Data = "Medical specialty has been deleted successfully."
                });
            }).WithName("DeleteMedicalSpecialty")
            .WithSummary("Handles requests to delete a specific record by its identifier and returns the appropriate result after the operation.")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Update Medical Specialty
            group.MapPost("/update", async (
                UpdateMedicalSpecialtyViewModel medicalSpecialty,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new UpdateMedicalSpecialtyCommand(medicalSpecialty));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = medicalSpecialty.Id
                });
            }).WithName("UpdateMedicalSpecialty")
            .WithSummary("Update medical specialty")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Get Medical Specialty By Id
            group.MapPost("/search-by-id", async (
                [FromBody] MedicalSpecialtySingleFilter request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                MedicalSpecialtyViewModel? result = await bus.QueryAsync(new GetMedicalSpecialtyByIdQuery(request.Id));

                return Results.Ok(new ResponseMessage<MedicalSpecialtyViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchMedicalSpecialty")
            .WithSummary("Retrieve a medical specialty record.")
            .Produces<ResponseMessage<MedicalSpecialtyViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<MedicalSpecialtyViewModel?>>(StatusCodes.Status400BadRequest);
            #endregion
        }
    }
}
