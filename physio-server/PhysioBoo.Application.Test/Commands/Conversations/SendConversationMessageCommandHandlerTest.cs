using NSubstitute;
using PhysioBoo.Application.Commands.Conversations.SendMessage;
using PhysioBoo.Application.ViewModels.Conversations;
using PhysioBoo.Domain.Entities.Workspace;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;
using System.Linq.Expressions;
using Xunit;

namespace PhysioBoo.Application.Test.Commands.Conversations
{
    public sealed class SendConversationMessageCommandHandlerTest : CommandHandlerFixtureBase
    {
        private readonly IConversationRepository _conversationRepository = Substitute.For<IConversationRepository>();
        private readonly IConversationParticipantRepository _participantRepository = Substitute.For<IConversationParticipantRepository>();
        private readonly IConversationMessageRepository _messageRepository = Substitute.For<IConversationMessageRepository>();
        private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
        private readonly SendConversationMessageCommandHandler _handler;

        public SendConversationMessageCommandHandlerTest()
        {
            _handler = new SendConversationMessageCommandHandler(
                Bus, UnitOfWork, NotificationHandler,
                _conversationRepository, _participantRepository, _messageRepository, _userRepository, User);
        }

        [Fact]
        public async Task Should_Report_Not_Found_When_Caller_Is_Not_A_Participant()
        {
            _participantRepository
                .ExistsAsync(Arg.Any<Expression<Func<ConversationParticipant, bool>>>(), Arg.Any<CancellationToken>())
                .Returns(false);

            Guid conversationId = Guid.NewGuid();
            await _handler.Handle(new SendConversationMessageCommand(conversationId, new SendConversationMessageViewModel(Guid.NewGuid(), "hello")), default);

            VerifyExistingNotification(ErrorCodes.ObjectNotFound, $"Conversation with id {conversationId} doesn't exist.");
            await _messageRepository.DidNotReceive().InsertAsync<ConversationMessage, Guid>(Arg.Any<ConversationMessage>());
            await UnitOfWork.DidNotReceive().BeginTransactionAsync(Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Should_Not_Touch_The_Database_When_Message_Is_Blank()
        {
            await _handler.Handle(new SendConversationMessageCommand(Guid.NewGuid(), new SendConversationMessageViewModel(Guid.NewGuid(), "  ")), default);

            VerifyAnyDomainNotification();
            await _participantRepository.DidNotReceive().ExistsAsync(Arg.Any<Expression<Func<ConversationParticipant, bool>>>(), Arg.Any<CancellationToken>());
            await _messageRepository.DidNotReceive().InsertAsync<ConversationMessage, Guid>(Arg.Any<ConversationMessage>());
        }
    }
}
