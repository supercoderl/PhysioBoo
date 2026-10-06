namespace PhysioBoo.Domain.Enums
{
    // Nursing calls Scheduled "Due" and has no Refused.
    public enum AdministrationStatus
    {
        Scheduled,
        Given,
        Missed,
        Refused,
        Held
    }
}
