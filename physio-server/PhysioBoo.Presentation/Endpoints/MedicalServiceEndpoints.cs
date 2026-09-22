using System.Text;
using PhysioBoo.Application.Commands.MedicalServices.ChangeMedicalServiceStatus;
using PhysioBoo.Application.Commands.MedicalServices.CreateMedicalService;
using PhysioBoo.Application.Commands.MedicalServices.DeleteMedicalService;
using PhysioBoo.Application.Commands.MedicalServices.DuplicateMedicalService;
using PhysioBoo.Application.Commands.MedicalServices.UpdateMedicalService;
using PhysioBoo.Application.Queries.MedicalServices.GetAll;
using PhysioBoo.Application.Queries.MedicalServices.GetById;
using PhysioBoo.Application.Queries.MedicalServices.GetStats;
using PhysioBoo.Application.ViewModels.MedicalServices;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class MedicalServiceEndpoints
    {
        public static void MapMedicalServiceEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/medical-services")
                .WithTags("Medical Services")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Search Medical Services
            group.MapPost("/search", async (
                [FromBody] PagedRequest<MedicalServiceFilter> request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<MedicalServiceViewModel> result = await bus.QueryAsync(new GetAllMedicalServicesQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<MedicalServiceViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchMedicalServices")
            .WithSummary("Retrieve a paginated list of medical services with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<MedicalServiceViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<MedicalServiceViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Cms.ServiceRead);
            #endregion

            #region Get Medical Service Stats
            group.MapGet("/stats", async (
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                MedicalServiceStatsViewModel result = await bus.QueryAsync(new GetMedicalServiceStatsQuery());

                return Results.Ok(new ResponseMessage<MedicalServiceStatsViewModel>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetMedicalServiceStats")
            .WithSummary("Retrieve KPI totals for the medical service catalog.")
            .Produces<ResponseMessage<MedicalServiceStatsViewModel>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Cms.ServiceRead);
            #endregion

            #region Export Medical Services
            group.MapPost("/export", async (
                [FromBody] PagedRequest<MedicalServiceFilter> request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                request.PageNumber = 1;
                request.PageSize = int.MaxValue;

                PagedResult<MedicalServiceViewModel> result = await bus.QueryAsync(new GetAllMedicalServicesQuery(request));

                byte[] csv = BuildCsv(result.Items);

                return Results.File(csv, "text/csv", $"medical-services-{DateTime.UtcNow:yyyyMMddHHmmss}.csv");
            }).WithName("ExportMedicalServices")
            .WithSummary("Export the filtered medical service catalog as CSV.")
            .Produces(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Cms.ServiceRead);
            #endregion

            #region Bulk Archive Medical Services
            group.MapPost("/bulk/archive", async (
                [FromBody] BulkIdsViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new ChangeMedicalServiceStatusCommand(request.Ids, ServiceStatus.Archived));

                return Results.Ok(new ResponseMessage<List<Guid>>
                {
                    Success = true,
                    Data = request.Ids
                });
            }).WithName("BulkArchiveMedicalServices")
            .WithSummary("Archive multiple medical services at once.")
            .Produces<ResponseMessage<List<Guid>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<List<Guid>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Cms.ServiceUpdate);
            #endregion

            #region Bulk Delete Medical Services
            group.MapPost("/bulk/delete", async (
                [FromBody] BulkIdsViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new DeleteMedicalServiceCommand(request.Ids));

                return Results.Ok(new ResponseMessage<List<Guid>>
                {
                    Success = true,
                    Data = request.Ids
                });
            }).WithName("BulkDeleteMedicalServices")
            .WithSummary("Delete multiple medical services at once.")
            .Produces<ResponseMessage<List<Guid>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<List<Guid>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Cms.ServiceDelete);
            #endregion

            #region Create New Medical Service
            group.MapPost("", async (
                [FromBody] CreateMedicalServiceViewModel newService,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                Guid newId = Guid.NewGuid();

                await bus.SendCommandAsync(new CreateMedicalServiceCommand(newId, newService));

                return Results.CreatedAtRoute(
                    "GetMedicalServiceById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newId
                    }
                );
            }).WithName("CreateMedicalService")
            .WithSummary("Create a new medical service.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Cms.ServiceCreate);
            #endregion

            #region Get Medical Service By Id
            group.MapGet("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                MedicalServiceViewModel? result = await bus.QueryAsync(new GetMedicalServiceByIdQuery(id));

                return Results.Ok(new ResponseMessage<MedicalServiceViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetMedicalServiceById")
            .WithSummary("Retrieve a single medical service.")
            .Produces<ResponseMessage<MedicalServiceViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<MedicalServiceViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Cms.ServiceRead);
            #endregion

            #region Update Medical Service
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] UpdateMedicalServiceViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpdateMedicalServiceCommand(id, request));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("UpdateMedicalService")
            .WithSummary("Update a medical service.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Cms.ServiceUpdate);
            #endregion

            #region Delete Medical Service
            group.MapDelete("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new DeleteMedicalServiceCommand(new List<Guid> { id }));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("DeleteMedicalService")
            .WithSummary("Delete a single medical service.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Cms.ServiceDelete);
            #endregion

            #region Archive / Restore / Publish / Duplicate
            group.MapPost("{id:guid}/archive", async (Guid id, IMediatorHandler bus, CancellationToken ct) =>
            {
                await bus.SendCommandAsync(new ChangeMedicalServiceStatusCommand(new List<Guid> { id }, ServiceStatus.Archived));
                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).WithName("ArchiveMedicalService")
            .WithSummary("Archive a medical service.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Cms.ServiceUpdate);

            group.MapPost("{id:guid}/restore", async (Guid id, IMediatorHandler bus, CancellationToken ct) =>
            {
                await bus.SendCommandAsync(new ChangeMedicalServiceStatusCommand(new List<Guid> { id }, ServiceStatus.Draft));
                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).WithName("RestoreMedicalService")
            .WithSummary("Restore an archived medical service back to Draft.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Cms.ServiceUpdate);

            group.MapPost("{id:guid}/publish", async (Guid id, IMediatorHandler bus, CancellationToken ct) =>
            {
                await bus.SendCommandAsync(new ChangeMedicalServiceStatusCommand(new List<Guid> { id }, ServiceStatus.Active));
                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).WithName("PublishMedicalService")
            .WithSummary("Publish a medical service, making it Active.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Cms.ServiceUpdate);

            group.MapPost("{id:guid}/duplicate", async (Guid id, IMediatorHandler bus, CancellationToken ct) =>
            {
                Guid newId = Guid.NewGuid();
                await bus.SendCommandAsync(new DuplicateMedicalServiceCommand(id, newId));
                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = newId });
            }).WithName("DuplicateMedicalService")
            .WithSummary("Duplicate a medical service as a new Draft.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Cms.ServiceCreate);
            #endregion
        }

        private static byte[] BuildCsv(IEnumerable<MedicalServiceViewModel> items)
        {
            StringBuilder sb = new StringBuilder();
            sb.AppendLine("Code,Name,Status,Availability,BasePrice,Currency,DurationMinutes,Department,PrimaryDoctor,CreatedAt");

            foreach (MedicalServiceViewModel s in items)
            {
                sb.AppendLine(string.Join(",",
                    CsvField(s.Code),
                    CsvField(s.Name),
                    CsvField(s.Status),
                    CsvField(s.Availability),
                    s.BasePrice.ToString(System.Globalization.CultureInfo.InvariantCulture),
                    CsvField(s.Currency),
                    s.DurationMinutes.ToString(),
                    CsvField(s.PrimaryDepartmentName ?? string.Empty),
                    CsvField(s.PrimaryDoctorName ?? string.Empty),
                    CsvField(s.CreatedAt.ToString("O"))
                ));
            }

            return Encoding.UTF8.GetBytes(sb.ToString());
        }

        private static string CsvField(string value)
        {
            if (value.Contains(',') || value.Contains('"') || value.Contains('\n'))
            {
                return $"\"{value.Replace("\"", "\"\"")}\"";
            }
            return value;
        }
    }
}
