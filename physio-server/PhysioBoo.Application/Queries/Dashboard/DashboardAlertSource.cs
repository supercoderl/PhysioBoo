namespace PhysioBoo.Application.Queries.Dashboard
{
    /// <summary>
    /// Dashboard alert ids are "{source}:{guid}" because the feed merges several alert tables.
    /// </summary>
    public static class DashboardAlertSource
    {
        public const string Lab = "lab";
        public const string Radiology = "rad";
        public const string Surgery = "sur";
        public const string Clinical = "cli";
        public const string Inventory = "inv";

        public static string Id(string source, Guid id) => $"{source}:{id}";

        public static bool TryParse(string? value, out string source, out Guid id)
        {
            source = string.Empty;
            id = Guid.Empty;
            if (string.IsNullOrWhiteSpace(value)) return false;

            string[] parts = value.Split(':', 2);
            if (parts.Length != 2 || !Guid.TryParse(parts[1], out id)) return false;

            source = parts[0].ToLowerInvariant();
            return source is Lab or Radiology or Surgery or Clinical or Inventory;
        }
    }
}
