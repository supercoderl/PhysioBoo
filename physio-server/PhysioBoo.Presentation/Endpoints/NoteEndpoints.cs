using PhysioBoo.Application.Commands.Notes.CreateNote;
using PhysioBoo.Application.Commands.Notes.DeleteNote;
using PhysioBoo.Application.Commands.Notes.UpdateNote;
using PhysioBoo.Application.Queries.Notes.GetAll;
using PhysioBoo.Application.Queries.Notes.GetLabels;
using PhysioBoo.Application.ViewModels.Notes;

namespace PhysioBoo.Presentation.Endpoints
{
    // Personal notes: every route is scoped to the signed-in user, so it needs a login but no permission code.
    public static class NoteEndpoints
    {
        public static void MapNoteEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/notes")
                .WithTags("Notes")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region List Notes
            group.MapGet("", async (
                [FromQuery] string? search,
                [FromQuery] string? label,
                [FromQuery] bool? archived,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                List<NoteViewModel> result = await bus.QueryAsync(new GetNotesQuery(search, label, archived ?? false));

                return Results.Ok(new ResponseMessage<List<NoteViewModel>> { Success = true, Data = result });
            }).WithName("GetNotes")
            .WithSummary("The signed-in user's notes: pinned first, then most recently changed.")
            .Produces<ResponseMessage<List<NoteViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization();
            #endregion

            #region List Labels
            group.MapGet("/labels", async (IMediatorHandler bus, CancellationToken ct) =>
            {
                List<NoteLabelViewModel> result = await bus.QueryAsync(new GetNoteLabelsQuery());

                return Results.Ok(new ResponseMessage<List<NoteLabelViewModel>> { Success = true, Data = result });
            }).WithName("GetNoteLabels")
            .WithSummary("Labels used on the signed-in user's active notes, with counts.")
            .Produces<ResponseMessage<List<NoteLabelViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization();
            #endregion

            #region Create Note
            group.MapPost("", async (
                [FromBody] SaveNoteViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                CreateNoteCommand command = new(Guid.NewGuid(), request);

                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<NoteViewModel?> { Success = true, Data = command.Result });
            }).WithName("CreateNote")
            .WithSummary("Create a note.")
            .Produces<ResponseMessage<NoteViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<NoteViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Update Note
            group.MapPut("{id:guid}", async (
                Guid id,
                [FromBody] SaveNoteViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                UpdateNoteCommand command = new(id, request);

                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<NoteViewModel?> { Success = true, Data = command.Result });
            }).WithName("UpdateNote")
            .WithSummary("Replace a note; also used to pin, archive or tick checklist items.")
            .Produces<ResponseMessage<NoteViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<NoteViewModel?>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<NoteViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization();
            #endregion

            #region Delete Note
            group.MapDelete("{id:guid}", async (Guid id, IMediatorHandler bus, CancellationToken ct) =>
            {
                await bus.SendCommandAsync(new DeleteNoteCommand(id));

                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).WithName("DeleteNote")
            .WithSummary("Delete a note.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization();
            #endregion
        }
    }
}
