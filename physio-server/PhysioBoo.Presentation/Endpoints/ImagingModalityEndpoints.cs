using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.ImagingModalities.CreateImagingModality;
using PhysioBoo.Application.Commands.ImagingModalities.DeleteImagingModality;
using PhysioBoo.Application.Commands.ImagingModalities.UpdateImagingModality;
using PhysioBoo.Application.Queries.ImagingModalities.GetAll;
using PhysioBoo.Application.Queries.ImagingModalities.GetById;
using PhysioBoo.Application.ViewModels.ImagingModalities;
using PhysioBoo.Domain.Constants;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class ImagingModalityEndpoints
    {
        public static void MapImagingModalityEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/imaging-modalities")
                .WithTags("Imaging Modalities")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Create New Imaging Modality
            group.MapPost("", async (
                [FromBody] CreateImagingModalityViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                Guid newId = Guid.NewGuid();
                await bus.SendCommandAsync(new CreateImagingModalityCommand(request, newId));

                return Results.CreatedAtRoute(
                    "GetImagingModalityById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newId
                    }
                );
            }).WithName("CreateImagingModality")
            .WithSummary("Create new imaging modality")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Imaging.ImagingModalityCreate);
            #endregion

            #region Get All Imaging Modalities
            group.MapPost("search", async (
                [FromBody] PagedRequest<ImagingModalityFilter> request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<ImagingModalityViewModel> result = await bus.QueryAsync(new GetAllImagingModalitiesQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<ImagingModalityViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetImagingModalities")
            .WithSummary("Retrieve a paginated list of imaging modalities with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<ImagingModalityViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<ImagingModalityViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Imaging.ImagingModalityRead);
            #endregion

            #region Delete Imaging Modality
            group.MapDelete("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new DeleteImagingModalityCommand(id));

                return Results.NoContent();
            }).WithName("DeleteImagingModality")
            .WithSummary("Handles requests to delete a specific imaging modality by its identifier.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Imaging.ImagingModalityDelete);
            #endregion

            #region Update Imaging Modality
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] UpdateImagingModalityViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpdateImagingModalityCommand(request, id));

                return Results.NoContent();
            }).WithName("UpdateImagingModality")
            .WithSummary("Update imaging modality")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Imaging.ImagingModalityUpdate);
            #endregion

            #region Get Imaging Modality By Id
            group.MapGet("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                ImagingModalityViewModel? result = await bus.QueryAsync(new GetImagingModalityByIdQuery(id));

                return Results.Ok(new ResponseMessage<ImagingModalityViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetImagingModalityById")
            .WithSummary("Retrieve an imaging modality record.")
            .Produces<ResponseMessage<ImagingModalityViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<ImagingModalityViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Imaging.ImagingModalityRead);
            #endregion
        }
    }
}
