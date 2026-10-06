using PhysioBoo.Application.Commands.PrescriptionTemplates.AddFavoriteMedication;
using PhysioBoo.Application.Commands.PrescriptionTemplates.CreatePrescriptionTemplate;
using PhysioBoo.Application.Commands.PrescriptionTemplates.DeletePrescriptionTemplate;
using PhysioBoo.Application.Commands.PrescriptionTemplates.RemoveFavoriteMedication;
using PhysioBoo.Application.Queries.PrescriptionTemplates.GetFavorites;
using PhysioBoo.Application.Queries.PrescriptionTemplates.GetRecentPrescriptions;
using PhysioBoo.Application.Queries.PrescriptionTemplates.GetTemplates;
using PhysioBoo.Application.ViewModels.PrescriptionTemplates;

namespace PhysioBoo.Presentation.Endpoints
{
    /// <summary>
    /// Prescribing shortcuts: a doctor's templates and favorite medications, and a patient's recent prescriptions.
    /// </summary>
    public static class PrescriptionTemplateEndpoints
    {
        public static void MapPrescriptionTemplateEndpoints(this IEndpointRouteBuilder app)
        {
            #region Templates
            RouteGroupBuilder templates = app.MapGroup("api/prescription-templates")
                .WithTags("Prescription Templates")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            templates.MapGet("", async ([FromQuery] Guid doctorId, IMediatorHandler bus) =>
                Ok(await bus.QueryAsync(new GetPrescriptionTemplatesQuery(doctorId))))
            .WithName("GetPrescriptionTemplates")
            .WithSummary("A doctor's active prescription templates, with lines ready to drop into a draft.")
            .Produces<ResponseMessage<List<PrescriptionTemplateViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.PrescriptionRead);

            templates.MapPost("", async ([FromBody] CreatePrescriptionTemplateViewModel body, IMediatorHandler bus) =>
            {
                Guid newId = Guid.NewGuid();
                await bus.SendCommandAsync(new CreatePrescriptionTemplateCommand(newId, body));

                List<PrescriptionTemplateViewModel> all = await bus.QueryAsync(new GetPrescriptionTemplatesQuery(body.DoctorId));
                return Ok(all.FirstOrDefault(t => t.Id == newId));
            })
            .WithName("CreatePrescriptionTemplate")
            .WithSummary("Save a set of medication lines as a reusable template.")
            .Produces<ResponseMessage<PrescriptionTemplateViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PrescriptionTemplateViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Pharmacy.PrescriptionCreate);

            templates.MapDelete("{id:guid}", async (Guid id, IMediatorHandler bus) =>
            {
                await bus.SendCommandAsync(new DeletePrescriptionTemplateCommand(id));
                return Ok(id);
            })
            .WithName("DeletePrescriptionTemplate")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.PrescriptionCreate);
            #endregion

            #region Favorites
            RouteGroupBuilder favorites = app.MapGroup("api/doctors/{doctorId:guid}/favorite-medications")
                .WithTags("Prescription Templates")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            favorites.MapGet("", async (Guid doctorId, IMediatorHandler bus) =>
                Ok(await bus.QueryAsync(new GetFavoriteMedicationsQuery(doctorId))))
            .WithName("GetFavoriteMedications")
            .Produces<ResponseMessage<List<FavoriteMedicationViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.PrescriptionRead);

            favorites.MapPost("", async (Guid doctorId, [FromBody] AddFavoriteMedicationViewModel body, IMediatorHandler bus) =>
            {
                AddFavoriteMedicationCommand command = new AddFavoriteMedicationCommand(Guid.NewGuid(), doctorId, body);
                await bus.SendCommandAsync(command);

                List<FavoriteMedicationViewModel> all = await bus.QueryAsync(new GetFavoriteMedicationsQuery(doctorId));
                return Ok(all.FirstOrDefault(f => f.Id == command.FavoriteId));
            })
            .WithName("AddFavoriteMedication")
            .WithSummary("Add a medicine to the doctor's favorites (or update its default dosing).")
            .Produces<ResponseMessage<FavoriteMedicationViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.PrescriptionCreate);

            favorites.MapDelete("{id:guid}", async (Guid doctorId, Guid id, IMediatorHandler bus) =>
            {
                await bus.SendCommandAsync(new RemoveFavoriteMedicationCommand(doctorId, id));
                return Ok(id);
            })
            .WithName("RemoveFavoriteMedication")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.PrescriptionCreate);
            #endregion

            #region Recent Prescriptions
            app.MapGroup("api/patients/{patientId:guid}/prescriptions")
                .WithTags("Prescription Templates")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>()
                .MapGet("/recent", async (Guid patientId, [FromQuery] int? take, IMediatorHandler bus) =>
                    Ok(await bus.QueryAsync(new GetRecentPrescriptionsQuery(patientId, take ?? 5))))
                .WithName("GetRecentPrescriptions")
                .WithSummary("The patient's latest issued / dispensed / cancelled prescriptions.")
                .Produces<ResponseMessage<List<RecentPrescriptionViewModel>>>(StatusCodes.Status200OK)
                .RequireAuthorization(Permissions.Pharmacy.PrescriptionRead);
            #endregion
        }

        private static IResult Ok<T>(T data)
        {
            return Results.Ok(new ResponseMessage<T>
            {
                Success = true,
                Data = data
            });
        }
    }
}
