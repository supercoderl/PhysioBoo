using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.Doctors.CreateDoctor;
using PhysioBoo.Application.Commands.Doctors.DeleteDoctor;
using PhysioBoo.Application.Commands.Doctors.UpdateDoctor;
using PhysioBoo.Application.Queries.Doctors.GetAll;
using PhysioBoo.Application.Queries.Doctors.GetById;
using PhysioBoo.Application.ViewModels.Doctors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class DoctorEndpoints
    {
        public static void MapDoctorEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/doctors")
                .WithTags("Doctors")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Create New Doctor
            group.MapPost("/create", async (
                CreateDoctorViewModel newDoctor,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateDoctorCommand(newDoctor));

                return Results.Created($"/api/doctors/create", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = "A new doctor has been created successfully."
                });
            }).WithName("CreateDoctor")
            .WithSummary("Create new doctor information")
            .Produces<ResponseMessage<string>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Get All Doctors
            group.MapPost("/search", async (
                [FromBody] PagedRequest<DoctorFilter> request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                PagedResult<DoctorViewModel> result = await bus.QueryAsync(new GetAllDoctorsQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<DoctorViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchDoctors")
            .WithSummary("Retrieve a paginated list of doctors with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<DoctorViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<DoctorViewModel>>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Delete Doctor
            group.MapPost("/delete", async (
                DeleteDoctorViewModel request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new DeleteDoctorCommand(request.Id, request.IsHard));

                return Results.Ok(new ResponseMessage<string>
                {
                    Success = true,
                    Data = "Doctor has been deleted successfully."
                });
            }).WithName("DeleteDoctor")
            .WithSummary("Handles requests to delete a specific record by its identifier and returns the appropriate result after the operation.")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Update Doctor
            group.MapPost("/update", async (
                UpdateDoctorViewModel Doctor,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new UpdateDoctorCommand(Doctor));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = Doctor.Id
                });
            }).WithName("UpdateDoctor")
            .WithSummary("Update doctor")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Get Doctor By Id
            group.MapPost("/search-by-id", async (
                [FromBody] DoctorSingleFilter request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                DoctorViewModel? result = await bus.QueryAsync(new GetDoctorByIdQuery(request.Id));

                return Results.Ok(new ResponseMessage<DoctorViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchDoctor")
            .WithSummary("Retrieve a doctor record.")
            .Produces<ResponseMessage<DoctorViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<DoctorViewModel?>>(StatusCodes.Status400BadRequest);
            #endregion
        }
    }
}
