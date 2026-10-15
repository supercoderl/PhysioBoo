using PhysioBoo.Application.Commands.Conversations;
using PhysioBoo.Domain.Entities.Workspace;
using Shouldly;
using Xunit;

namespace PhysioBoo.Application.Test.Commands.Conversations
{
    public sealed class ConversationAccessTest
    {
        [Fact]
        public void Direct_Key_Is_The_Same_From_Both_Sides()
        {
            Guid a = Guid.NewGuid();
            Guid b = Guid.NewGuid();

            Conversation.BuildDirectKey(a, b).ShouldBe(Conversation.BuildDirectKey(b, a));
            Conversation.BuildDirectKey(a, b).Length.ShouldBe(65);
        }

        [Fact]
        public void Preview_Is_A_Single_Line()
        {
            ConversationAccess.BuildPreview("Room 3\n\n  at   2pm ").ShouldBe("Room 3 at 2pm");
        }

        [Fact]
        public void Preview_Is_Capped()
        {
            string preview = ConversationAccess.BuildPreview(new string('x', 500));

            preview.Length.ShouldBe(ConversationAccess.MaxPreviewLength);
            preview.ShouldEndWith("…");
        }
    }
}
