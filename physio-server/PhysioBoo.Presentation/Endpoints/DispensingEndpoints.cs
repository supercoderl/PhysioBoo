using PhysioBoo.Application.Commands.Dispensing.ChangeDispenseStatus;
using PhysioBoo.Application.Commands.Dispensing.CompleteDispensing;
using PhysioBoo.Application.Commands.Dispensing.ReplaceDispenseItem;
using PhysioBoo.Application.Commands.Dispensing.ReserveDispenseItem;
using PhysioBoo.Application.Commands.Dispensing.ScanDispenseItem;
using PhysioBoo.Application.Commands.Dispensing.UpdateDispenseItem;
using PhysioBoo.Application.Commands.Prescriptions.AcknowledgeClinicalWarning;
using PhysioBoo.Application.Queries.Dispensing.GetMedicineBatches;
using PhysioBoo.Application.Queries.Dispensing.GetMedicineDetail;
using PhysioBoo.Application.Queries.Dispensing.GetQueue;
using PhysioBoo.Application.Queries.Dispensing.GetStats;
using PhysioBoo.Application.Queries.Dispensing.GetWorkspace;
using PhysioBoo.Application.ViewModels.Dispensing;

namespace PhysioBoo.Presentation.Endpoints
{
    /// <summary>
    /// Clinical dispensing workspace. The queue id and workspace id are both the prescription id;
    /// item ids are prescription item ids.
    /// </summary>
    public static class DispensingEndpoints
    {
        public static void MapDispensingEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/pharmacy/dispensing")
                .WithTags("Dispensing")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Queue & Lookups
            group.MapGet("/queue", async ([FromQuery] string? search, [FromQuery] string? status, IMediatorHandler bus) =>
                Ok(await bus.QueryAsync(new GetDispenseQueueQuery(search, status))))
            .WithName("GetDispenseQueue")
            .WithSummary("Prescriptions waiting to be dispensed, plus those closed today.")
            .Produces<ResponseMessage<PagedResult<DispenseQueueItemViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.DispensingRead);

            group.MapGet("/stats", async (IMediatorHandler bus) =>
                Ok(await bus.QueryAsync(new GetDispenseStatsQuery())))
            .WithName("GetDispenseStats")
            .Produces<ResponseMessage<DispenseQueueStatsViewModel>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.DispensingRead);

            group.MapGet("/queue/{prescriptionId:guid}/workspace", async (Guid prescriptionId, IMediatorHandler bus) =>
                Ok(await bus.QueryAsync(new GetDispenseWorkspaceQuery(prescriptionId))))
            .WithName("GetDispenseWorkspace")
            .WithSummary("Patient summary, medication lines, batches, alerts and alternatives for one prescription.")
            .Produces<ResponseMessage<DispenseWorkspaceViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<DispenseWorkspaceViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Pharmacy.DispensingRead);

            group.MapGet("/medicines/{medicineId:guid}/batches", async (Guid medicineId, IMediatorHandler bus) =>
                Ok(await bus.QueryAsync(new GetDispenseBatchesQuery(medicineId))))
            .WithName("GetDispenseBatches")
            .WithSummary("Usable batches for a medicine, first-expiry first.")
            .Produces<ResponseMessage<List<DispenseBatchOptionViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.DispensingRead);

            group.MapGet("/medicines/{medicineId:guid}/detail", async (Guid medicineId, IMediatorHandler bus) =>
                Ok(await bus.QueryAsync(new GetDispenseMedicineDetailQuery(medicineId))))
            .WithName("GetDispenseMedicineDetail")
            .Produces<ResponseMessage<DispenseMedicineDetailViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<DispenseMedicineDetailViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Pharmacy.DispensingRead);
            #endregion

            #region Line Actions
            group.MapPost("/workspace/{prescriptionId:guid}/alerts/{alertId:guid}/acknowledge", async (
                Guid prescriptionId,
                Guid alertId,
                [FromBody] DispenseNoteViewModel? body,
                IMediatorHandler bus
            ) =>
            {
                await bus.SendCommandAsync(new AcknowledgeClinicalWarningCommand(alertId));
                return Ok(new { alertId });
            })
            .WithName("AcknowledgeDispenseAlert")
            .WithSummary("Acknowledge a clinical alert on a prescription line.")
            .RequireAuthorization(Permissions.Pharmacy.DispensingProcess);

            group.MapPatch("/workspace/{prescriptionId:guid}/items/{itemId:guid}", async (
                Guid prescriptionId,
                Guid itemId,
                [FromBody] UpdateDispenseItemViewModel body,
                IMediatorHandler bus
            ) =>
            {
                await bus.SendCommandAsync(new UpdateDispenseItemCommand(prescriptionId, itemId, body.QtyToDispense, body.Status, body.BatchNo));
                return Ok(await ItemAsync(bus, prescriptionId, itemId));
            })
            .WithName("UpdateDispenseItem")
            .WithSummary("Change quantity, pick status or batch of a line.")
            .Produces<ResponseMessage<DispenseMedicationItemViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.DispensingProcess);

            group.MapPost("/workspace/{prescriptionId:guid}/items/{itemId:guid}/replace", async (
                Guid prescriptionId,
                Guid itemId,
                [FromBody] ReplaceDispenseItemViewModel body,
                IMediatorHandler bus
            ) =>
            {
                await bus.SendCommandAsync(new ReplaceDispenseItemCommand(prescriptionId, itemId, body.AlternativeMedicineId, body.Reason ?? string.Empty));
                return Ok(await ItemAsync(bus, prescriptionId, itemId));
            })
            .WithName("ReplaceDispenseItem")
            .WithSummary("Substitute a same-generic medicine (only when the prescriber allowed substitution).")
            .Produces<ResponseMessage<DispenseMedicationItemViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.DispensingProcess);

            group.MapPost("/workspace/{prescriptionId:guid}/items/{itemId:guid}/reserve", async (
                Guid prescriptionId,
                Guid itemId,
                [FromBody] DispenseNoteViewModel? body,
                IMediatorHandler bus
            ) =>
            {
                await bus.SendCommandAsync(new ReserveDispenseItemCommand(prescriptionId, itemId));
                return Ok(await ItemAsync(bus, prescriptionId, itemId));
            })
            .WithName("ReserveDispenseItem")
            .WithSummary("Reserve the line's quantity on its batch.")
            .Produces<ResponseMessage<DispenseMedicationItemViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.DispensingProcess);

            group.MapPost("/workspace/{prescriptionId:guid}/items/{itemId:guid}/scan", async (
                Guid prescriptionId,
                Guid itemId,
                [FromBody] ScanDispenseItemViewModel body,
                IMediatorHandler bus
            ) =>
            {
                ScanDispenseItemCommand command = new ScanDispenseItemCommand(prescriptionId, itemId, body.Barcode);
                await bus.SendCommandAsync(command);
                return Ok(new { matched = command.Matched });
            })
            .WithName("ScanDispenseItem")
            .WithSummary("Verify a line by scanning the medicine barcode / drug code / batch number.")
            .RequireAuthorization(Permissions.Pharmacy.DispensingProcess);
            #endregion

            #region Workspace Actions
            group.MapPost("/workspace/{prescriptionId:guid}/hold", async (Guid prescriptionId, [FromBody] DispenseReasonViewModel body, IMediatorHandler bus) =>
            {
                await bus.SendCommandAsync(new ChangeDispenseStatusCommand(prescriptionId, DispenseSessionAction.Hold, body.Reason ?? string.Empty));
                return Ok(new { workspaceId = prescriptionId });
            })
            .WithName("HoldDispensing")
            .WithSummary("Put the prescription on hold (reservations are kept).")
            .RequireAuthorization(Permissions.Pharmacy.DispensingProcess);

            group.MapPost("/workspace/{prescriptionId:guid}/cancel", async (Guid prescriptionId, [FromBody] DispenseReasonViewModel body, IMediatorHandler bus) =>
            {
                await bus.SendCommandAsync(new ChangeDispenseStatusCommand(prescriptionId, DispenseSessionAction.Cancel, body.Reason ?? string.Empty));
                return Ok(new { workspaceId = prescriptionId });
            })
            .WithName("CancelDispensing")
            .WithSummary("Cancel dispensing and the prescription; releases all reservations.")
            .RequireAuthorization(Permissions.Pharmacy.DispensingProcess);

            group.MapPost("/workspace/{prescriptionId:guid}/complete", async (Guid prescriptionId, [FromBody] CompleteDispensingViewModel body, IMediatorHandler bus) =>
            {
                CompleteDispensingCommand command = new CompleteDispensingCommand(prescriptionId, body.PharmacistNotes);
                await bus.SendCommandAsync(command);
                return Ok(command.Summary);
            })
            .WithName("CompleteDispensing")
            .WithSummary("Deduct stock, record movements and mark the prescription dispensed.")
            .Produces<ResponseMessage<DispenseSummaryViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<DispenseSummaryViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Pharmacy.DispensingProcess);
            #endregion
        }

        private static async Task<DispenseMedicationItemViewModel?> ItemAsync(IMediatorHandler bus, Guid prescriptionId, Guid itemId)
        {
            DispenseWorkspaceViewModel? workspace = await bus.QueryAsync(new GetDispenseWorkspaceQuery(prescriptionId));
            return workspace?.Items.FirstOrDefault(i => i.Id == itemId);
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
