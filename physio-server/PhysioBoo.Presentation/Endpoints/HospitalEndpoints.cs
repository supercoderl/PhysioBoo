using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.Hospitals.CreateHospital;
using PhysioBoo.Application.Commands.Hospitals.DeleteHospital;
using PhysioBoo.Application.Commands.Hospitals.UpdateHospital;
using PhysioBoo.Application.Queries.Hospitals.GetAll;
using PhysioBoo.Application.Queries.Hospitals.GetById;
using PhysioBoo.Application.ViewModels.Hospitals;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class HospitalEndpoints
    {
        public static void MapHospitalEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/hospitals")
                .WithTags("Hospitals")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Create New Hospital
            group.MapPost("/create", async (
                CreateHospitalViewModel newHospital,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateHospitalCommand(newHospital));

                return Results.Created($"/api/hospitals/{newHospital.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newHospital.Id
                });
            }).WithName("CreateHospital")
            .WithSummary("Create new hospital")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Get All Hospitals
            group.MapPost("/search", async (
                [FromBody] PagedRequest<HospitalFilter> request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                PagedResult<HospitalViewModel> result = await bus.QueryAsync(new GetAllHospitalsQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<HospitalViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchHospitals")
            .WithSummary("Retrieve a paginated list of hospitals with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<HospitalViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<HospitalViewModel>>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Delete Hospital
            group.MapPost("/delete", async (
                DeleteHospitalViewModel request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new DeleteHospitalCommand(request.Id, request.IsHard));

                return Results.Ok(new ResponseMessage<string>
                {
                    Success = true,
                    Data = "Hospital has been deleted successfully."
                });
            }).WithName("DeleteHospital")
            .WithSummary("Handles requests to delete a specific record by its identifier and returns the appropriate result after the operation.")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Update Hospital
            group.MapPost("/update", async (
                UpdateHospitalViewModel Hospital,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new UpdateHospitalCommand(Hospital));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = Hospital.Id
                });
            }).WithName("UpdateHospital")
            .WithSummary("Update hospital")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Get Hospital By Id
            group.MapPost("/search-by-id", async (
                [FromBody] HospitalSingleFilter request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                HospitalViewModel? result = await bus.QueryAsync(new GetHospitalByIdQuery(request.Id));

                return Results.Ok(new ResponseMessage<HospitalViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchHospital")
            .WithSummary("Retrieve a hospital record.")
            .Produces<ResponseMessage<HospitalViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<HospitalViewModel?>>(StatusCodes.Status400BadRequest);
            #endregion
        }
    }
}
