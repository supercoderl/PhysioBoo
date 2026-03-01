using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.ImagingModalities.CreateImagingModality;
using PhysioBoo.Application.Commands.ImagingModalities.DeleteImagingModality;
using PhysioBoo.Application.Commands.ImagingModalities.UpdateImagingModality;
using PhysioBoo.Application.Queries.ImagingModalities.GetAll;
using PhysioBoo.Application.Queries.ImagingModalities.GetById;
using PhysioBoo.Application.ViewModels.ImagingModalities;
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
            group.MapPost("/create", async (
                CreateImagingModalityViewModel newImagingModality,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateImagingModalityCommand(newImagingModality));

                return Results.Created($"/api/imaging-modalities/{newImagingModality.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newImagingModality.Id
                });
            }).WithName("CreateImagingModality")
            .WithSummary("Create new imaging modality")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Get All Imaging Modalities
            group.MapPost("/search", async (
                [FromBody] PagedRequest<ImagingModalityFilter> request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                PagedResult<ImagingModalityViewModel> result = await bus.QueryAsync(new GetAllImagingModalitiesQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<ImagingModalityViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchImagingModalities")
            .WithSummary("Retrieve a paginated list of imaging modalities with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<ImagingModalityViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<ImagingModalityViewModel>>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Delete Imaging Modality
            group.MapPost("/delete", async (
                DeleteImagingModalityViewModel request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new DeleteImagingModalityCommand(request.Id, request.IsHard));

                return Results.Ok(new ResponseMessage<string>
                {
                    Success = true,
                    Data = "Imaging modality has been deleted successfully."
                });
            }).WithName("DeleteImagingModality")
            .WithSummary("Handles requests to delete a specific record by its identifier and returns the appropriate result after the operation.")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Update Imaging Modality
            group.MapPost("/update", async (
                UpdateImagingModalityViewModel ImagingModality,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new UpdateImagingModalityCommand(ImagingModality));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = ImagingModality.Id
                });
            }).WithName("UpdateImagingModality")
            .WithSummary("Update imaging modality")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Get Imaging Modality By Id
            group.MapPost("/search-by-id", async (
                [FromBody] ImagingModalitySingleFilter request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                ImagingModalityViewModel? result = await bus.QueryAsync(new GetImagingModalityByIdQuery(request.Id));

                return Results.Ok(new ResponseMessage<ImagingModalityViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchImagingModality")
            .WithSummary("Retrieve a imaging modality record.")
            .Produces<ResponseMessage<ImagingModalityViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<ImagingModalityViewModel?>>(StatusCodes.Status400BadRequest);
            #endregion
        }
    }
}
