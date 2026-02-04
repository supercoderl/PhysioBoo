using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.MedicalSpecialties.CreateMedicalSpecialty;
using PhysioBoo.Application.Queries.MedicalSpecialties.GetAll;
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
        }
    }
}
