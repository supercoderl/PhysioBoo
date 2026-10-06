namespace PhysioBoo.Application.Queries.Surgeries
{
    // today | week (last 7 days) | month (last 30 days). The window runs to the end of today.
    internal sealed record SurgeryRange(DateTime Start, DateTime End)
    {
        public int Days => Math.Max(1, (int)Math.Ceiling((End - Start).TotalDays));

        public static SurgeryRange From(string? range, DateTime now, string defaultRange)
        {
            DateTime tomorrow = now.Date.AddDays(1);

            return (string.IsNullOrWhiteSpace(range) ? defaultRange : range).Trim().ToLowerInvariant() switch
            {
                "week" => new SurgeryRange(now.Date.AddDays(-6), tomorrow),
                "month" => new SurgeryRange(now.Date.AddDays(-29), tomorrow),
                _ => new SurgeryRange(now.Date, tomorrow)
            };
        }
    }
}
