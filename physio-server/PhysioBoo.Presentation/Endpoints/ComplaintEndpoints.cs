using PhysioBoo.Application.Commands.Complaints.CreateComplaint;
using PhysioBoo.Application.Commands.Complaints.DeleteComplaint;
using PhysioBoo.Application.Commands.Complaints.UpdateComplaint;
using PhysioBoo.Application.Queries.Complaints.GetAll;
using PhysioBoo.Application.Queries.Complaints.GetById;
using PhysioBoo.Application.Queries.Complaints.GetStats;
using PhysioBoo.Application.ViewModels.Complaints;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class ComplaintEndpoints
    {
        public static void MapComplaintEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/complaints")
                .WithTags("Complaints")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Search Complaints
            group.MapPost("/search", async (
                [FromBody] PagedRequest<ComplaintFilter> request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<ComplaintViewModel> result = await bus.QueryAsync(new GetAllComplaintsQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<ComplaintViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchComplaints")
            .WithSummary("Retrieve a paginated list of complaints with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<ComplaintViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<ComplaintViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Crm.ComplaintRead);
            #endregion

            #region Get Complaint Stats
            group.MapGet("/stats", async (
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                ComplaintStatsViewModel result = await bus.QueryAsync(new GetComplaintStatsQuery());

                return Results.Ok(new ResponseMessage<ComplaintStatsViewModel>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetComplaintStats")
            .WithSummary("Retrieve KPI totals for complaints.")
            .Produces<ResponseMessage<ComplaintStatsViewModel>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Crm.ComplaintRead);
            #endregion

            #region Create Complaint
            group.MapPost("", async (
                [FromBody] CreateComplaintViewModel newComplaint,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                Guid newId = Guid.NewGuid();

                await bus.SendCommandAsync(new CreateComplaintCommand(newId, newComplaint));

                return Results.CreatedAtRoute(
                    "GetComplaintById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newId
                    }
                );
            }).WithName("CreateComplaint")
            .WithSummary("Log a new complaint.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Crm.ComplaintCreate);
            #endregion

            #region Get Complaint By Id
            group.MapGet("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                ComplaintViewModel? result = await bus.QueryAsync(new GetComplaintByIdQuery(id));

                return Results.Ok(new ResponseMessage<ComplaintViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetComplaintById")
            .WithSummary("Retrieve a single complaint.")
            .Produces<ResponseMessage<ComplaintViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<ComplaintViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Crm.ComplaintRead);
            #endregion

            #region Update Complaint
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] UpdateComplaintViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpdateComplaintCommand(id, request));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("UpdateComplaint")
            .WithSummary("Update a complaint, including its status.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Crm.ComplaintUpdate);
            #endregion

            #region Delete Complaint
            group.MapDelete("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new DeleteComplaintCommand(id, false));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("DeleteComplaint")
            .WithSummary("Delete a single complaint (soft delete).")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Crm.ComplaintDelete);
            #endregion
        }
    }
}
