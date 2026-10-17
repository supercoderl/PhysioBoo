namespace PhysioBoo.Application.Commands.Public.SendContactMessage
{
    /// <summary>Topics offered by the contact form, keyed by the value the form sends.</summary>
    public static class PublicContactTopics
    {
        public static readonly IReadOnlyDictionary<string, string> Labels = new Dictionary<string, string>
        {
            ["general"] = "General question",
            ["appointment"] = "Appointment enquiry",
            ["service"] = "Service information",
            ["feedback"] = "Feedback",
            ["complaint"] = "Complaint",
        };
    }
}
