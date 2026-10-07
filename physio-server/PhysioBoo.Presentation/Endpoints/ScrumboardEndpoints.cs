using PhysioBoo.Application.Commands.Scrumboard.MoveList;
using PhysioBoo.Application.Commands.Scrumboard.CreateBoard;
using PhysioBoo.Application.Commands.Scrumboard.CreateCard;
using PhysioBoo.Application.Commands.Scrumboard.CreateList;
using PhysioBoo.Application.Commands.Scrumboard.DeleteBoard;
using PhysioBoo.Application.Commands.Scrumboard.DeleteCard;
using PhysioBoo.Application.Commands.Scrumboard.DeleteList;
using PhysioBoo.Application.Commands.Scrumboard.MoveCard;
using PhysioBoo.Application.Commands.Scrumboard.UpdateBoard;
using PhysioBoo.Application.Commands.Scrumboard.UpdateCard;
using PhysioBoo.Application.Commands.Scrumboard.UpdateList;
using PhysioBoo.Application.Queries.Scrumboard.GetBoard;
using PhysioBoo.Application.Queries.Scrumboard.GetBoards;
using PhysioBoo.Application.ViewModels.Scrumboard;

namespace PhysioBoo.Presentation.Endpoints
{
    // Boards are shared by the whole tenant: every route needs a login but no permission code.
    public static class ScrumboardEndpoints
    {
        public static void MapScrumboardEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/scrumboard")
                .WithTags("Scrumboard")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Boards
            group.MapGet("/boards", async (IMediatorHandler bus, CancellationToken ct) =>
            {
                List<ScrumBoardSummaryViewModel> result = await bus.QueryAsync(new GetScrumBoardsQuery());

                return Results.Ok(new ResponseMessage<List<ScrumBoardSummaryViewModel>> { Success = true, Data = result });
            }).WithName("GetScrumBoards")
            .WithSummary("Every board of the tenant, most recently changed first.")
            .Produces<ResponseMessage<List<ScrumBoardSummaryViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization();

            group.MapPost("/boards", async ([FromBody] SaveScrumBoardViewModel request, IMediatorHandler bus, CancellationToken ct) =>
            {
                CreateScrumBoardCommand command = new(Guid.NewGuid(), request);

                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<ScrumBoardSummaryViewModel?> { Success = true, Data = command.Result });
            }).WithName("CreateScrumBoard")
            .WithSummary("Create a board.")
            .Produces<ResponseMessage<ScrumBoardSummaryViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<ScrumBoardSummaryViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();

            group.MapGet("/boards/{id:guid}", async (Guid id, IMediatorHandler bus, CancellationToken ct) =>
            {
                ScrumBoardViewModel? result = await bus.QueryAsync(new GetScrumBoardQuery(id));

                return Results.Ok(new ResponseMessage<ScrumBoardViewModel?> { Success = true, Data = result });
            }).WithName("GetScrumBoard")
            .WithSummary("A board with its columns and cards.")
            .Produces<ResponseMessage<ScrumBoardViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<ScrumBoardViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization();

            group.MapPut("/boards/{id:guid}", async (Guid id, [FromBody] SaveScrumBoardViewModel request, IMediatorHandler bus, CancellationToken ct) =>
            {
                await bus.SendCommandAsync(new UpdateScrumBoardCommand(id, request));

                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).WithName("UpdateScrumBoard")
            .WithSummary("Rename a board or change its description.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization();

            group.MapDelete("/boards/{id:guid}", async (Guid id, IMediatorHandler bus, CancellationToken ct) =>
            {
                await bus.SendCommandAsync(new DeleteScrumBoardCommand(id));

                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).WithName("DeleteScrumBoard")
            .WithSummary("Delete a board. Only its creator can.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization();
            #endregion

            #region Lists
            group.MapPost("/boards/{boardId:guid}/lists", async (Guid boardId, [FromBody] SaveScrumListViewModel request, IMediatorHandler bus, CancellationToken ct) =>
            {
                CreateScrumListCommand command = new(Guid.NewGuid(), boardId, request);

                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<ScrumListViewModel?> { Success = true, Data = command.Result });
            }).WithName("CreateScrumList")
            .WithSummary("Add a column to the right of a board.")
            .Produces<ResponseMessage<ScrumListViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<ScrumListViewModel?>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<ScrumListViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization();

            group.MapPut("/lists/{id:guid}", async (Guid id, [FromBody] SaveScrumListViewModel request, IMediatorHandler bus, CancellationToken ct) =>
            {
                await bus.SendCommandAsync(new UpdateScrumListCommand(id, request));

                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).WithName("UpdateScrumList")
            .WithSummary("Rename a column.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization();

            group.MapPost("/lists/{id:guid}/move", async (Guid id, [FromBody] MoveScrumListViewModel request, IMediatorHandler bus, CancellationToken ct) =>
            {
                await bus.SendCommandAsync(new MoveScrumListCommand(id, request));

                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).WithName("MoveScrumList")
            .WithSummary("Move a column to a position on its board; all columns are renumbered.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization();

            group.MapDelete("/lists/{id:guid}", async (Guid id, IMediatorHandler bus, CancellationToken ct) =>
            {
                await bus.SendCommandAsync(new DeleteScrumListCommand(id));

                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).WithName("DeleteScrumList")
            .WithSummary("Delete an empty column.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization();
            #endregion

            #region Cards
            group.MapPost("/lists/{listId:guid}/cards", async (Guid listId, [FromBody] SaveScrumCardViewModel request, IMediatorHandler bus, CancellationToken ct) =>
            {
                CreateScrumCardCommand command = new(Guid.NewGuid(), listId, request);

                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<ScrumCardViewModel?> { Success = true, Data = command.Result });
            }).WithName("CreateScrumCard")
            .WithSummary("Add a card to the bottom of a column.")
            .Produces<ResponseMessage<ScrumCardViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<ScrumCardViewModel?>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<ScrumCardViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization();

            group.MapPut("/cards/{id:guid}", async (Guid id, [FromBody] SaveScrumCardViewModel request, IMediatorHandler bus, CancellationToken ct) =>
            {
                UpdateScrumCardCommand command = new(id, request);

                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<ScrumCardViewModel?> { Success = true, Data = command.Result });
            }).WithName("UpdateScrumCard")
            .WithSummary("Change a card's title, description or due date.")
            .Produces<ResponseMessage<ScrumCardViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<ScrumCardViewModel?>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<ScrumCardViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization();

            group.MapDelete("/cards/{id:guid}", async (Guid id, IMediatorHandler bus, CancellationToken ct) =>
            {
                await bus.SendCommandAsync(new DeleteScrumCardCommand(id));

                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).WithName("DeleteScrumCard")
            .WithSummary("Delete a card.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization();

            group.MapPost("/cards/{id:guid}/move", async (Guid id, [FromBody] MoveScrumCardViewModel request, IMediatorHandler bus, CancellationToken ct) =>
            {
                await bus.SendCommandAsync(new MoveScrumCardCommand(id, request));

                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).WithName("MoveScrumCard")
            .WithSummary("Move a card to a position in a column of the same board; both columns are renumbered.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization();
            #endregion
        }
    }
}
