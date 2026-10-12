namespace PhysioBoo.Infrastructure.Database.DevData
{
    /// <summary>Small in-house source of random but plausible values, so the generators need no extra package.</summary>
    internal sealed class DevDataFaker
    {
        private static readonly string[] Cities = { "Springfield", "Riverside", "Lakeside", "Hillcrest", "Brookfield", "Fairview", "Westport", "Northgate", "Oakridge", "Maplewood" };
        private static readonly string[] Streets = { "Main Street", "Park Avenue", "Healthcare Boulevard", "Harbor Road", "Garden Lane", "University Drive" };
        private static readonly string[] Provinces = { "Central", "North", "South", "East", "West" };
        private static readonly string[] Insurers = { "Aurora Health", "BlueLeaf", "Summit Care", "Unity Mutual" };
        private static readonly string[] Languages = { "English", "Vietnamese", "French", "Spanish" };

        private readonly Random _random;

        public DevDataFaker(Random random)
        {
            _random = random;
        }

        public T Pick<T>(IReadOnlyList<T> items) => items[_random.Next(items.Count)];

        public int Between(int min, int max) => _random.Next(min, max + 1);

        public bool Chance(double probability) => _random.NextDouble() < probability;

        public string City() => Pick(Cities);

        public string Street() => $"{Between(1, 999)} {Pick(Streets)}";

        public string Province() => Pick(Provinces);

        /// <summary>Up to 20 characters, the column limit for phone numbers.</summary>
        public string Phone() => $"+1 555 {Between(100, 999)} {Between(1000, 9999)}";

        public string PostalCode() => Between(10000, 99999).ToString();

        public string Email(string name, string domain = "dev.physioboo.test")
        {
            string local = new string(name.ToLowerInvariant().Where(char.IsLetterOrDigit).ToArray());
            return $"{local}{Between(1, 999)}@{domain}";
        }

        public string[] InsuranceAccepted() => Insurers.OrderBy(_ => _random.Next()).Take(Between(1, 3)).ToArray();

        public string[] LanguagesSupported() => Languages.OrderBy(_ => _random.Next()).Take(Between(1, 3)).ToArray();

        public decimal Latitude() => Math.Round((decimal)(_random.NextDouble() * 120 - 60), 4);

        public decimal Longitude() => Math.Round((decimal)(_random.NextDouble() * 340 - 170), 4);

        public decimal Money(int min, int max) => Between(min, max) * 1000m;
    }
}
