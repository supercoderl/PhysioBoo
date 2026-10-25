
using PhysioBoo.Application.Commands.Doctors.CreateDoctor;
using PhysioBoo.Application.Commands.Doctors.DeleteDoctor;
using PhysioBoo.Application.Commands.Doctors.RemoveDoctorAvatar;
using PhysioBoo.Application.Commands.Doctors.UpdateDoctor;
using PhysioBoo.Application.Commands.Doctors.UploadDoctorAvatar;
using PhysioBoo.Application.Queries.Doctors.GetAll;
using PhysioBoo.Application.Queries.Doctors.GetById;
using PhysioBoo.Application.ViewModels.Doctors;






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
            group.MapPost("", async (
                [FromBody] CreateDoctorViewModel newDoctor,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                Guid newId = Guid.NewGuid();

                await bus.SendCommandAsync(new CreateDoctorCommand(newDoctor, newId));

                return Results.CreatedAtRoute(
                    "GetDoctorById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newId
                    }
                );
            }).WithName("CreateDoctor")
            .WithSummary("Create a doctor together with the user account and profile.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Hr.DoctorRegister);
            #endregion

            #region Get All Doctors
            group.MapPost("search", async (
                [FromBody] PagedRequest<DoctorFilter> request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<DoctorViewModel> result = await bus.QueryAsync(new GetAllDoctorsQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<DoctorViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetDoctors")
            .WithSummary("Retrieve a paginated list of doctors with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<DoctorViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<DoctorViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Hr.DoctorRead);
            #endregion

            #region Delete Doctor
            group.MapDelete("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new DeleteDoctorCommand(id));

                return Results.NoContent();
            }).WithName("DeleteDoctor")
            .WithSummary("Handles requests to delete a specific doctor by its identifier.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Hr.DoctorDelete);
            #endregion

            #region Update Doctor
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] UpdateDoctorViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpdateDoctorCommand(request, id));

                return Results.NoContent();
            }).WithName("UpdateDoctor")
            .WithSummary("Update doctor")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Hr.DoctorUpdate);
            #endregion

            #region Doctor Avatar
            group.MapPost("{id:guid}/avatar", async (
                Guid id,
                IFormFile file,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                UploadDoctorAvatarCommand command = new UploadDoctorAvatarCommand(id, file);

                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<string?>
                {
                    Success = true,
                    Data = command.AvatarUrl
                });
            }).WithName("UploadDoctorAvatar")
            .WithSummary("Upload or replace a doctor's avatar (JPEG, PNG or WebP, up to 5 MB).")
            .Produces<ResponseMessage<string?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string?>>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .DisableAntiforgery()
            .RequireAuthorization(Permissions.Hr.DoctorUpdate);

            group.MapDelete("{id:guid}/avatar", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new RemoveDoctorAvatarCommand(id));

                return Results.NoContent();
            }).WithName("RemoveDoctorAvatar")
            .WithSummary("Remove a doctor's avatar.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Hr.DoctorUpdate);
            #endregion

            #region Get Doctor By Id
            group.MapGet("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                DoctorViewModel? result = await bus.QueryAsync(new GetDoctorByIdQuery(id));

                return Results.Ok(new ResponseMessage<DoctorViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetDoctorById")
            .WithSummary("Retrieve a doctor record.")
            .Produces<ResponseMessage<DoctorViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<DoctorViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Hr.DoctorRead);
            #endregion
        }
    }
}
