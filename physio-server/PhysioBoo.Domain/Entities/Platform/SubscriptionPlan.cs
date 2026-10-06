namespace PhysioBoo.Domain.Entities.Platform
{
    /// <summary>
    /// A SaaS plan a tenant (hospital group) can subscribe to. Platform-wide, not tenant-scoped.
    /// </summary>
    public class SubscriptionPlan : AuditEntity
    {
        #region Core Subscription Plan Table (9)
        public string Code { get; private set; }
        public string Name { get; private set; }
        public string? Description { get; private set; }
        public decimal MonthlyPrice { get; private set; }
        public string Currency { get; private set; }
        public int? MaxUsers { get; private set; }
        public int? MaxBranches { get; private set; }
        public bool IsActive { get; private set; }
        public int SortOrder { get; private set; }
        #endregion

        #region Constructor (9)
        public SubscriptionPlan(
            Guid id,
            string code,
            string name,
            string? description,
            decimal monthlyPrice,
            string currency,
            int? maxUsers,
            int? maxBranches,
            int sortOrder
        ) : base(id)
        {
            Code = code;
            Name = name;
            Description = description;
            MonthlyPrice = monthlyPrice;
            Currency = currency;
            MaxUsers = maxUsers;
            MaxBranches = maxBranches;
            SortOrder = sortOrder;
            IsActive = true;
        }
        #endregion

        #region Setter Methods
        public void SetName(string name) { Name = name; }
        public void SetDescription(string? description) { Description = description; }
        public void SetMonthlyPrice(decimal monthlyPrice) { MonthlyPrice = monthlyPrice; }
        public void SetCurrency(string currency) { Currency = currency; }
        public void SetMaxUsers(int? maxUsers) { MaxUsers = maxUsers; }
        public void SetMaxBranches(int? maxBranches) { MaxBranches = maxBranches; }
        public void SetIsActive(bool isActive) { IsActive = isActive; }
        public void SetSortOrder(int sortOrder) { SortOrder = sortOrder; }
        #endregion
    }
}
