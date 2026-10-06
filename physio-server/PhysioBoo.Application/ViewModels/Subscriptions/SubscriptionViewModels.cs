using PhysioBoo.Domain.Entities.Platform;

namespace PhysioBoo.Application.ViewModels.Subscriptions
{
    public sealed class SubscriptionPlanViewModel
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal MonthlyPrice { get; set; }
        public string Currency { get; set; } = string.Empty;
        public int? MaxUsers { get; set; }
        public int? MaxBranches { get; set; }
        public bool IsActive { get; set; }
        public int SortOrder { get; set; }
        public int SubscriberCount { get; set; }

        public static SubscriptionPlanViewModel FromEntity(SubscriptionPlan plan, int subscriberCount = 0) => new()
        {
            Id = plan.Id,
            Code = plan.Code,
            Name = plan.Name,
            Description = plan.Description,
            MonthlyPrice = plan.MonthlyPrice,
            Currency = plan.Currency,
            MaxUsers = plan.MaxUsers,
            MaxBranches = plan.MaxBranches,
            IsActive = plan.IsActive,
            SortOrder = plan.SortOrder,
            SubscriberCount = subscriberCount
        };
    }

    public class TenantSubscriptionViewModel
    {
        public Guid HospitalGroupId { get; set; }
        public string TenantName { get; set; } = string.Empty;
        public string? TenantEmail { get; set; }
        public Guid? SubscriptionId { get; set; }
        public Guid? PlanId { get; set; }
        public string? PlanName { get; set; }
        public decimal MonthlyPrice { get; set; }
        public string Currency { get; set; } = "USD";
        /// <summary>Trial | Active | PastDue | Cancelled | None (tenant has no subscription yet).</summary>
        public string Status { get; set; } = "None";
        public DateTime? CurrentPeriodStart { get; set; }
        public DateTime? CurrentPeriodEnd { get; set; }
        public DateTime? TrialEndsAt { get; set; }
        public int OpenInvoiceCount { get; set; }
        public decimal OutstandingAmount { get; set; }
    }

    public sealed class TenantSubscriptionDetailViewModel : TenantSubscriptionViewModel
    {
        public DateTime? StartedAt { get; set; }
        public DateTime? CancelledAt { get; set; }
        public string? BillingEmail { get; set; }
        public string? Notes { get; set; }
        public List<SubscriptionInvoiceViewModel> Invoices { get; set; } = new();
    }

    public sealed class SubscriptionInvoiceViewModel
    {
        public Guid Id { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public string PlanName { get; set; } = string.Empty;
        public DateTime PeriodStart { get; set; }
        public DateTime PeriodEnd { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime IssuedAt { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime? PaidAt { get; set; }
        public string? PaymentReference { get; set; }

        public static SubscriptionInvoiceViewModel FromEntity(SubscriptionInvoice invoice) => new()
        {
            Id = invoice.Id,
            InvoiceNumber = invoice.InvoiceNumber,
            PlanName = invoice.PlanName,
            PeriodStart = invoice.PeriodStart,
            PeriodEnd = invoice.PeriodEnd,
            Amount = invoice.Amount,
            Currency = invoice.Currency,
            Status = invoice.Status.ToString(),
            IssuedAt = invoice.IssuedAt,
            DueDate = invoice.DueDate,
            PaidAt = invoice.PaidAt,
            PaymentReference = invoice.PaymentReference
        };
    }

    public sealed record SaveSubscriptionPlanViewModel(
        string Code,
        string Name,
        string? Description,
        decimal MonthlyPrice,
        string Currency,
        int? MaxUsers,
        int? MaxBranches,
        bool IsActive,
        int SortOrder
    );

    public sealed record ChangeSubscriptionViewModel(string Action, Guid? PlanId, string? BillingEmail, string? Notes);

    public sealed record SettleSubscriptionInvoiceViewModel(string? PaymentReference);
}
