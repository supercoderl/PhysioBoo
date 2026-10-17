using PhysioBoo.Application.Commands.Public.SendContactMessage;
using PhysioBoo.Application.ViewModels.Public;
using PhysioBoo.Domain.Errors;
using Xunit;

namespace PhysioBoo.Application.Test.Commands
{
    public sealed class PublicContactMessageTest : ValidationTestBase<SendPublicContactMessageCommand, SendPublicContactMessageCommandValidation>
    {
        public PublicContactMessageTest() : base(new SendPublicContactMessageCommandValidation()) { }

        private static SendPublicContactMessageCommand Command(PublicContactMessageViewModel? m = null) =>
            new(Guid.NewGuid(), Guid.NewGuid(), m ?? Valid);

        private static readonly PublicContactMessageViewModel Valid =
            new("Lan Pham", "0901 234 567", null, null, null, "Is shoulder rehabilitation available?", true, null);

        [Fact]
        public void Accepts_A_Message_With_Only_The_Required_Fields()
        {
            ShouldBeValid(Command());
            ShouldBeValid(Command(Valid with { Email = "lan.pham@example.com", Topic = "service", ClinicId = Guid.NewGuid() }));
        }

        [Fact]
        public void Requires_Consent()
        {
            ShouldHaveSingleError(Command(Valid with { Consent = false }), ErrorCodes.InvalidValue, "Tick the box to agree to the Privacy Policy so we can reply.");
        }

        [Fact]
        public void Rejects_An_Unknown_Topic()
        {
            ShouldHaveSingleError(Command(Valid with { Topic = "billing" }), ErrorCodes.InvalidValue, "Choose a topic from the list.");
        }

        [Fact]
        public void Rejects_A_Blank_Or_Too_Long_Message()
        {
            ShouldHaveSingleError(Command(Valid with { Message = "   " }), ErrorCodes.InvalidValue, "Enter your message.");
            ShouldHaveSingleError(Command(Valid with { Message = new string('a', SendPublicContactMessageCommandValidation.MessageMaxLength + 1) }),
                ErrorCodes.InvalidValue, "Keep your message under 1,500 characters.");
        }

        [Fact]
        public void Rejects_An_Invalid_Phone_Or_Email()
        {
            ShouldHaveSingleError(Command(Valid with { Phone = "0901" }), ErrorCodes.InvalidValue, "Enter a valid phone number, for example 0901 234 567.");
            ShouldHaveSingleError(Command(Valid with { Email = "lan@" }), DomainErrorCodes.Lead.InvalidEmail);
        }

        [Fact]
        public void Notes_Keep_The_Whole_Message_Within_The_Column()
        {
            string message = new('m', SendPublicContactMessageCommandValidation.MessageMaxLength);
            string notes = SendPublicContactMessageCommandHandler.BuildNotes("Complaint", new string('c', 600), Guid.NewGuid(), message);

            Assert.True(notes.Length <= 2000);
            Assert.EndsWith("\n\n" + message, notes);
        }

        [Fact]
        public void Service_Label_Fits_The_Column()
        {
            Assert.All(PublicContactTopics.Labels.Values, t => Assert.True(SendPublicContactMessageCommandHandler.ServiceLabel(t).Length <= 64));
        }
    }
}
