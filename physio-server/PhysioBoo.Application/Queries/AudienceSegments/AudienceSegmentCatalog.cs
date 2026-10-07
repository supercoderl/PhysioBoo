namespace PhysioBoo.Application.Queries.AudienceSegments
{
    /// <summary>
    /// Built-in audience segments. Members are computed live from patient, member and lead data,
    /// so segments need no table of their own. Ids are fixed because campaigns store them.
    /// </summary>
    public static class AudienceSegmentCatalog
    {
        public static readonly Guid AllPatients = Guid.Parse("5e6a0001-0000-4000-8000-000000000001");
        public static readonly Guid MarketingConsent = Guid.Parse("5e6a0001-0000-4000-8000-000000000002");
        public static readonly Guid VipPatients = Guid.Parse("5e6a0001-0000-4000-8000-000000000003");
        public static readonly Guid SeniorCitizens = Guid.Parse("5e6a0001-0000-4000-8000-000000000004");
        public static readonly Guid ChronicPatients = Guid.Parse("5e6a0001-0000-4000-8000-000000000005");
        public static readonly Guid ActiveMembers = Guid.Parse("5e6a0001-0000-4000-8000-000000000006");
        public static readonly Guid OpenLeads = Guid.Parse("5e6a0001-0000-4000-8000-000000000007");

        public static readonly IReadOnlyList<(Guid Id, string Name, string Criteria)> Segments = new List<(Guid, string, string)>
        {
            (AllPatients, "All patients", "Every registered patient"),
            (MarketingConsent, "Marketing opt-in", "Patients who consented to marketing"),
            (VipPatients, "VIP patients", "Patients flagged as VIP"),
            (SeniorCitizens, "Senior citizens", "Patients flagged as senior citizens"),
            (ChronicPatients, "Chronic care", "Patients flagged as chronic"),
            (ActiveMembers, "Loyalty members", "Members with an active points account"),
            (OpenLeads, "Open leads", "Leads that are not converted or lost"),
        };

        public static string? FindName(Guid? id)
        {
            if (id == null) return null;
            foreach ((Guid Id, string Name, string Criteria) s in Segments)
            {
                if (s.Id == id) return s.Name;
            }
            return null;
        }
    }
}
