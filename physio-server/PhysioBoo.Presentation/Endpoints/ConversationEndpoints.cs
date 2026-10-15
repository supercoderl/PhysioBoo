using PhysioBoo.Application.Commands.Conversations.MarkRead;
using PhysioBoo.Application.Commands.Conversations.OpenDirectConversation;
using PhysioBoo.Application.Commands.Conversations.SendMessage;
using PhysioBoo.Application.Queries.Conversations.GetContacts;
using PhysioBoo.Application.Queries.Conversations.GetMessages;
using PhysioBoo.Application.ViewModels.Conversations;

namespace PhysioBoo.Presentation.Endpoints
{
    // Team chat between staff of the same tenant. Every route acts as the signed-in user and checks membership
    // in the handler, so it needs a login but no permission code.
    public static class ConversationEndpoints
    {
        public static void MapConversationEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/conversations")
                .WithTags("Conversations")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region List Contacts
            group.MapGet("/contacts", async (IMediatorHandler bus, CancellationToken ct) =>
            {
                List<ChatContactViewModel> result = await bus.QueryAsync(new GetChatContactsQuery());

                return Results.Ok(new ResponseMessage<List<ChatContactViewModel>> { Success = true, Data = result });
            }).WithName("GetChatContacts")
            .WithSummary("Colleagues of the signed-in user with their direct conversation summary and unread count.")
            .Produces<ResponseMessage<List<ChatContactViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization();
            #endregion

            #region Open Direct Conversation
            group.MapPost("/direct", async (
                [FromBody] OpenDirectConversationViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                OpenDirectConversationCommand command = new(request.UserId);

                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<Guid?> { Success = true, Data = command.Result });
            }).WithName("OpenDirectConversation")
            .WithSummary("Get or create the direct conversation with a colleague; returns its id.")
            .Produces<ResponseMessage<Guid?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid?>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid?>>(StatusCodes.Status403Forbidden)
            .RequireAuthorization();
            #endregion

            #region Get Messages
            group.MapGet("{id:guid}/messages", async (
                Guid id,
                [FromQuery] Guid? before,
                [FromQuery] Guid? after,
                [FromQuery] int? limit,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                ConversationMessagesViewModel? result = await bus.QueryAsync(new GetConversationMessagesQuery(id, before, after, limit));

                return Results.Ok(new ResponseMessage<ConversationMessagesViewModel?> { Success = true, Data = result });
            }).WithName("GetConversationMessages")
            .WithSummary("Messages of a conversation, oldest first: the newest page, an older page (before) or new ones (after).")
            .Produces<ResponseMessage<ConversationMessagesViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<ConversationMessagesViewModel?>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<ConversationMessagesViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization();
            #endregion

            #region Send Message
            group.MapPost("{id:guid}/messages", async (
                Guid id,
                [FromBody] SendConversationMessageViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                SendConversationMessageCommand command = new(id, request);

                await bus.SendCommandAsync(command);

                return Results.Ok(new ResponseMessage<ConversationMessageViewModel?> { Success = true, Data = command.Result });
            }).WithName("SendConversationMessage")
            .WithSummary("Send a message; resending the same client id returns the stored message.")
            .Produces<ResponseMessage<ConversationMessageViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<ConversationMessageViewModel?>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<ConversationMessageViewModel?>>(StatusCodes.Status403Forbidden)
            .Produces<ResponseMessage<ConversationMessageViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization();
            #endregion

            #region Mark Read
            group.MapPost("{id:guid}/read", async (
                Guid id,
                [FromBody] MarkConversationReadViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new MarkConversationReadCommand(id, request.MessageId));

                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).WithName("MarkConversationRead")
            .WithSummary("Mark the conversation as read up to a message for the signed-in user.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status404NotFound)
            .RequireAuthorization();
            #endregion
        }
    }
}
