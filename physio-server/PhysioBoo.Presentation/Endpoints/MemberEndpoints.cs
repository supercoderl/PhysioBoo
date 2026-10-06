using PhysioBoo.Application.Commands.Members.AddPoints;
using PhysioBoo.Application.Commands.Members.DeleteMember;
using PhysioBoo.Application.Commands.Members.EnrollMember;
using PhysioBoo.Application.Commands.Members.RedeemPoints;
using PhysioBoo.Application.Commands.Members.UpdateMember;
using PhysioBoo.Application.Queries.Members.GetAll;
using PhysioBoo.Application.Queries.Members.GetById;
using PhysioBoo.Application.Queries.Members.GetStats;
using PhysioBoo.Application.Queries.Members.GetTransactions;
using PhysioBoo.Application.ViewModels.Members;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class MemberEndpoints
    {
        public static void MapMemberEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/members")
                .WithTags("Members")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Search Members
            group.MapPost("/search", async (
                [FromBody] PagedRequest<MemberFilter> request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<MemberViewModel> result = await bus.QueryAsync(new GetAllMembersQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<MemberViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchMembers")
            .WithSummary("Retrieve a paginated list of loyalty members with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<MemberViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<MemberViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Crm.MemberRead);
            #endregion

            #region Get Member Stats
            group.MapGet("/stats", async (
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                MemberStatsViewModel result = await bus.QueryAsync(new GetMemberStatsQuery());

                return Results.Ok(new ResponseMessage<MemberStatsViewModel>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetMemberStats")
            .WithSummary("Retrieve KPI totals for the loyalty programme.")
            .Produces<ResponseMessage<MemberStatsViewModel>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Crm.MemberRead);
            #endregion

            #region Enroll Member
            group.MapPost("", async (
                [FromBody] EnrollMemberViewModel newMember,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                Guid newId = Guid.NewGuid();

                await bus.SendCommandAsync(new EnrollMemberCommand(newId, newMember));

                return Results.CreatedAtRoute(
                    "GetMemberById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newId
                    }
                );
            }).WithName("EnrollMember")
            .WithSummary("Enroll an existing patient in the loyalty programme.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Crm.MemberCreate);
            #endregion

            #region Get Member By Id
            group.MapGet("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                MemberViewModel? result = await bus.QueryAsync(new GetMemberByIdQuery(id));

                return Results.Ok(new ResponseMessage<MemberViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetMemberById")
            .WithSummary("Retrieve a single member.")
            .Produces<ResponseMessage<MemberViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<MemberViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Crm.MemberRead);
            #endregion

            #region Update Member
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] UpdateMemberViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpdateMemberCommand(id, request));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("UpdateMember")
            .WithSummary("Change a member's tier and status.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Crm.MemberUpdate);
            #endregion

            #region Delete Member
            group.MapDelete("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new DeleteMemberCommand(id));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("DeleteMember")
            .WithSummary("Remove a member from the loyalty programme (soft delete).")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Crm.MemberDelete);
            #endregion

            #region Search Member Transactions
            group.MapPost("{id:guid}/transactions/search", async (
                Guid id,
                [FromBody] PagedRequest<PointTransactionFilter> request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<PointTransactionViewModel> result = await bus.QueryAsync(new GetMemberTransactionsQuery(id, request));

                return Results.Ok(new ResponseMessage<PagedResult<PointTransactionViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchMemberTransactions")
            .WithSummary("Retrieve a member's point history, newest first.")
            .Produces<ResponseMessage<PagedResult<PointTransactionViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<PointTransactionViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Crm.MemberRead);
            #endregion

            #region Add Points
            group.MapPost("{id:guid}/points/add", async (
                Guid id,
                [FromBody] AddPointsViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new AddPointsCommand(id, request));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("AddMemberPoints")
            .WithSummary("Add points to a member.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Crm.PointAdd);
            #endregion

            #region Redeem Points
            group.MapPost("{id:guid}/points/redeem", async (
                Guid id,
                [FromBody] RedeemPointsViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new RedeemPointsCommand(id, request));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("RedeemMemberPoints")
            .WithSummary("Redeem a reward with a member's points.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Crm.PointRedeem);
            #endregion
        }
    }
}
