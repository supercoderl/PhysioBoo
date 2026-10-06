using PhysioBoo.Application.Commands.Admissions.CreateAdmission;
using PhysioBoo.Application.Commands.Admissions.DischargeAdmission;
using PhysioBoo.Application.Commands.Admissions.UpdateAdmission;
using PhysioBoo.Application.Queries.Admissions.GetAll;
using PhysioBoo.Application.Queries.Admissions.GetById;
using PhysioBoo.Application.ViewModels.Admissions;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class AdmissionEndpoints
    {
        public static void MapAdmissionEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/admissions")
                .WithTags("Admissions")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Search Admissions
            group.MapPost("/search", async (
                [FromBody] PagedRequest<AdmissionFilter> request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<AdmissionViewModel> result = await bus.QueryAsync(new GetAllAdmissionsQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<AdmissionViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchAdmissions")
            .WithSummary("Retrieve a paginated list of admissions with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<AdmissionViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<AdmissionViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Inpatient.AdmissionRead);
            #endregion

            #region Create Admission
            group.MapPost("", async (
                [FromBody] CreateAdmissionViewModel newAdmission,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                Guid newId = Guid.NewGuid();

                await bus.SendCommandAsync(new CreateAdmissionCommand(newId, newAdmission));

                return Results.CreatedAtRoute(
                    "GetAdmissionById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newId
                    }
                );
            }).WithName("CreateAdmission")
            .WithSummary("Admit an existing patient, optionally into an available bed.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Inpatient.AdmissionCreate);
            #endregion

            #region Get Admission By Id
            group.MapGet("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                AdmissionViewModel? result = await bus.QueryAsync(new GetAdmissionByIdQuery(id));

                return Results.Ok(new ResponseMessage<AdmissionViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetAdmissionById")
            .WithSummary("Retrieve a single admission.")
            .Produces<ResponseMessage<AdmissionViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<AdmissionViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Inpatient.AdmissionRead);
            #endregion

            #region Update Admission
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] UpdateAdmissionViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpdateAdmissionCommand(id, request));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("UpdateAdmission")
            .WithSummary("Update the clinical and insurance details of an active admission.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Inpatient.AdmissionUpdate);
            #endregion

            #region Discharge Admission
            group.MapPost("{id:guid}/discharge", async (
                Guid id,
                [FromBody] DischargeAdmissionViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new DischargeAdmissionCommand(id, request));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("DischargeAdmission")
            .WithSummary("Discharge an admission. Frees its bed if it has one.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Inpatient.AdmissionDischarge);
            #endregion
        }
    }
}
