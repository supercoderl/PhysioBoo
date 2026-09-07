namespace PhysioBoo.Domain.Enums
{
    public enum TransactionStatus
    {
        Created = 0,
        Pending = 1,
        Authorized = 2,   // funds on-hold; capture required (two-step flows)
        Succeeded = 3,
        Failed = 4,
        Cancelled = 5,
        Refunded = 6,
        AwaitingDeposit = 7, // e.g. virtual-account / deposit-code payment types
    }
}
