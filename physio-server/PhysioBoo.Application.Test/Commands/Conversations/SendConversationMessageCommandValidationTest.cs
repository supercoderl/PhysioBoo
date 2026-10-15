using PhysioBoo.Application.Commands.Conversations.SendMessage;
using PhysioBoo.Application.ViewModels.Conversations;
using PhysioBoo.Domain.Errors;
using Xunit;

namespace PhysioBoo.Application.Test.Commands.Conversations
{
    public sealed class SendConversationMessageCommandValidationTest
        : ValidationTestBase<SendConversationMessageCommand, SendConversationMessageCommandValidation>
    {
        public SendConversationMessageCommandValidationTest() : base(new SendConversationMessageCommandValidation())
        {
        }

        private static SendConversationMessageCommand Command(string? content, Guid? conversationId = null, Guid? messageId = null)
        {
            return new SendConversationMessageCommand(
                conversationId ?? Guid.NewGuid(),
                new SendConversationMessageViewModel(messageId ?? Guid.NewGuid(), content));
        }

        [Fact]
        public void Should_Be_Valid()
        {
            ShouldBeValid(Command("Can you cover room 3 at 2pm?"));
        }

        [Fact]
        public void Should_Allow_Max_Length_After_Trimming()
        {
            ShouldBeValid(Command("  " + new string('x', 2000) + "  "));
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("   \n\t ")]
        public void Should_Reject_Blank_Content(string? content)
        {
            ShouldHaveSingleError(Command(content), DomainErrorCodes.Conversation.EmptyContent);
        }

        [Fact]
        public void Should_Reject_Too_Long_Content()
        {
            ShouldHaveSingleError(Command(new string('x', 2001)), DomainErrorCodes.Conversation.ContentExceedsMaxLength);
        }

        [Fact]
        public void Should_Reject_Empty_Message_Id()
        {
            ShouldHaveSingleError(Command("hi", messageId: Guid.Empty), DomainErrorCodes.Conversation.EmptyMessageId);
        }

        [Fact]
        public void Should_Reject_Empty_Conversation_Id()
        {
            ShouldHaveSingleError(Command("hi", conversationId: Guid.Empty), DomainErrorCodes.Conversation.EmptyId);
        }
    }
}
