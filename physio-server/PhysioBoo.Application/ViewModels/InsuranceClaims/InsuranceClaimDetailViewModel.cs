using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Entities.Finance;
using PhysioBoo.Domain.Entities.Operation;

namespace PhysioBoo.Application.ViewModels.InsuranceClaims
{
    public sealed class InsuranceClaimDetailViewModel : InsuranceClaimCardViewModel
    {
        public string PolicyNumber { get; set; } = string.Empty;
        public InsuranceCoverageSummaryViewModel Coverage { get; set; } = new();
        public string Diagnosis { get; set; } = string.Empty;
        public string[] Procedures { get; set; } = Array.Empty<string>();
        public string? HospitalNotes { get; set; }
        public InsuranceInvoiceSummaryViewModel Invoice { get; set; } = new();
        public List<InsuranceClaimDocumentViewModel> Documents { get; set; } = new();
        public List<InsuranceClaimTimelineEventViewModel> Timeline { get; set; } = new();
        public List<InsuranceClaimMessageViewModel> Communication { get; set; } = new();
        public List<InsuranceClaimNoteViewModel> Notes { get; set; } = new();
        public List<InsuranceClaimAuditLogViewModel> AuditLogs { get; set; } = new();

        /// <summary>
        /// Expects InsuranceCompany, Patient, Documents, Activities and Bill.BillItems to be loaded.
        /// <paramref name="usedCoverage"/> is the amount already approved on the same policy by other claims.
        /// </summary>
        public static InsuranceClaimDetailViewModel FromEntity(InsuranceClaim claim, decimal usedCoverage)
        {
            InsuranceClaimDetailViewModel vm = new InsuranceClaimDetailViewModel();
            vm.Fill(claim);

            decimal totalCoverage = claim.InsuranceCompany?.MaximumCoverageAmount is > 0
                ? claim.InsuranceCompany.MaximumCoverageAmount.Value
                : claim.ClaimAmount;

            vm.PolicyNumber = claim.PolicyNumber;
            vm.Coverage = new InsuranceCoverageSummaryViewModel
            {
                TotalCoverage = totalCoverage,
                UsedAmount = usedCoverage,
                AvailableAmount = Math.Max(0, totalCoverage - usedCoverage),
                ValidUntil = string.Empty
            };
            vm.Diagnosis = claim.Diagnosis;
            vm.Procedures = claim.Procedures;
            vm.HospitalNotes = claim.HospitalNotes;
            vm.Invoice = BuildInvoice(claim);

            vm.Documents = claim.Documents
                .OrderByDescending(d => d.Required)
                .ThenBy(d => d.CreatedAt)
                .Select(d => new InsuranceClaimDocumentViewModel
                {
                    Id = d.Id,
                    Name = d.Name,
                    Type = d.Type,
                    Status = d.Status.ToString(),
                    Required = d.Required,
                    UploadedAt = d.UploadedAt,
                    UploadedBy = d.UploadedBy,
                    SizeKb = d.SizeKb,
                    PreviewUrl = d.Url
                })
                .ToList();

            List<InsuranceClaimActivity> activities = claim.Activities.OrderBy(a => a.OccurredAt).ToList();

            vm.Timeline = activities
                .Where(a => a.Kind == InsuranceClaimActivityKind.Timeline)
                .Select(a => new InsuranceClaimTimelineEventViewModel { Id = a.Id, Type = a.EventType ?? string.Empty, OccurredAt = a.OccurredAt, Actor = a.Actor, Note = a.Message })
                .ToList();

            vm.Communication = activities
                .Where(a => a.Kind == InsuranceClaimActivityKind.Message)
                .Select(InsuranceClaimMessageViewModel.FromEntity)
                .ToList();

            vm.Notes = activities
                .Where(a => a.Kind == InsuranceClaimActivityKind.Note)
                .Select(InsuranceClaimNoteViewModel.FromEntity)
                .ToList();

            vm.AuditLogs = activities
                .Where(a => a.Kind == InsuranceClaimActivityKind.Audit)
                .OrderByDescending(a => a.OccurredAt)
                .Select(a => new InsuranceClaimAuditLogViewModel { Id = a.Id, Action = a.EventType ?? string.Empty, Actor = a.Actor, OccurredAt = a.OccurredAt, Details = a.Details })
                .ToList();

            return vm;
        }

        private static InsuranceInvoiceSummaryViewModel BuildInvoice(InsuranceClaim claim)
        {
            Bill? bill = claim.Bill;
            if (bill == null)
            {
                // No linked bill: present the claimed amount as a single line.
                return new InsuranceInvoiceSummaryViewModel
                {
                    Subtotal = claim.ClaimAmount,
                    Total = claim.ClaimAmount,
                    LineItems = new List<InsuranceInvoiceLineItemViewModel>
                    {
                        new() { Id = claim.Id, Description = claim.Diagnosis, Quantity = 1, UnitPrice = claim.ClaimAmount, Amount = claim.ClaimAmount }
                    }
                };
            }

            return new InsuranceInvoiceSummaryViewModel
            {
                Subtotal = bill.Subtotal,
                Discount = bill.DiscountAmount,
                Tax = bill.TaxAmount,
                Total = bill.TotalAmount,
                LineItems = bill.BillItems.Select(i => new InsuranceInvoiceLineItemViewModel
                {
                    Id = i.Id,
                    Description = i.ItemName ?? i.Description ?? i.ItemCode ?? string.Empty,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    Amount = i.TotalAmount
                }).ToList()
            };
        }
    }

    public sealed class InsuranceCoverageSummaryViewModel
    {
        public decimal TotalCoverage { get; set; }
        public decimal UsedAmount { get; set; }
        public decimal AvailableAmount { get; set; }
        public string ValidUntil { get; set; } = string.Empty;
    }

    public sealed class InsuranceInvoiceSummaryViewModel
    {
        public decimal Subtotal { get; set; }
        public decimal Discount { get; set; }
        public decimal Tax { get; set; }
        public decimal Total { get; set; }
        public List<InsuranceInvoiceLineItemViewModel> LineItems { get; set; } = new();
    }

    public sealed class InsuranceInvoiceLineItemViewModel
    {
        public Guid Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Amount { get; set; }
    }

    public sealed class InsuranceClaimDocumentViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public bool Required { get; set; }
        public DateTime? UploadedAt { get; set; }
        public string? UploadedBy { get; set; }
        public int? SizeKb { get; set; }
        public string? PreviewUrl { get; set; }

        public static InsuranceClaimDocumentViewModel FromEntity(InsuranceClaimDocument d) => new()
        {
            Id = d.Id,
            Name = d.Name,
            Type = d.Type,
            Status = d.Status.ToString(),
            Required = d.Required,
            UploadedAt = d.UploadedAt,
            UploadedBy = d.UploadedBy,
            SizeKb = d.SizeKb,
            PreviewUrl = d.Url
        };
    }

    public sealed class InsuranceClaimTimelineEventViewModel
    {
        public Guid Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public DateTime OccurredAt { get; set; }
        public string Actor { get; set; } = string.Empty;
        public string? Note { get; set; }
    }

    public sealed class InsuranceClaimMessageViewModel
    {
        public Guid Id { get; set; }
        public string Direction { get; set; } = string.Empty;
        public string From { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }

        public static InsuranceClaimMessageViewModel FromEntity(InsuranceClaimActivity a) => new()
        {
            Id = a.Id,
            Direction = a.Direction ?? "Outbound",
            From = a.Actor,
            Message = a.Message ?? string.Empty,
            SentAt = a.OccurredAt
        };
    }

    public sealed class InsuranceClaimNoteViewModel
    {
        public Guid Id { get; set; }
        public string Author { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }

        public static InsuranceClaimNoteViewModel FromEntity(InsuranceClaimActivity a) => new()
        {
            Id = a.Id,
            Author = a.Actor,
            Message = a.Message ?? string.Empty,
            CreatedAt = a.OccurredAt
        };
    }

    public sealed class InsuranceClaimAuditLogViewModel
    {
        public Guid Id { get; set; }
        public string Action { get; set; } = string.Empty;
        public string Actor { get; set; } = string.Empty;
        public DateTime OccurredAt { get; set; }
        public string? Details { get; set; }
    }
}
