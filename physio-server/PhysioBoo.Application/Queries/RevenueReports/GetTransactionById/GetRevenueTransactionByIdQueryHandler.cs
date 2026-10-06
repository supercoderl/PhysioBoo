using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.RevenueReports;
using PhysioBoo.Domain.Entities.Finance;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.RevenueReports.GetTransactionById
{
    public sealed class GetRevenueTransactionByIdQueryHandler : IRequestHandler<GetRevenueTransactionByIdQuery, RevenueTransactionDetailViewModel?>
    {
        private readonly IBillRepository _billRepository;
        private readonly IInsuranceClaimRepository _claimRepository;
        private readonly IMediatorHandler _bus;

        public GetRevenueTransactionByIdQueryHandler(
            IBillRepository billRepository,
            IInsuranceClaimRepository claimRepository,
            IMediatorHandler bus
        )
        {
            _billRepository = billRepository;
            _claimRepository = claimRepository;
            _bus = bus;
        }

        public async Task<RevenueTransactionDetailViewModel?> Handle(GetRevenueTransactionByIdQuery request, CancellationToken ct)
        {
            Bill? bill = await _billRepository
                .GetAllNoTracking(b => b.Id == request.Id, includeProperties: RevenueReportScope.BillIncludes + ",BillItems")
                .AsSplitQuery()
                .FirstOrDefaultAsync(ct);

            if (bill == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetRevenueTransactionByIdQuery),
                    $"Transaction with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return null;
            }

            RevenueTransactionViewModel row = RevenueReportScope.ToTransaction(bill);

            InsuranceClaim? claim = await _claimRepository
                .GetAllNoTracking(c => c.BillId == bill.Id, includeProperties: "InsuranceCompany")
                .OrderByDescending(c => c.CreatedAt)
                .FirstOrDefaultAsync(ct);

            return new RevenueTransactionDetailViewModel
            {
                Id = row.Id,
                BillNo = row.BillNo,
                Datetime = row.Datetime,
                PatientName = row.PatientName,
                Department = row.Department,
                DoctorName = row.DoctorName,
                PaymentMethod = row.PaymentMethod,
                Amount = row.Amount,
                Discount = row.Discount,
                Refund = row.Refund,
                Status = row.Status,
                Notes = bill.Notes,
                LineItems = bill.BillItems.Select(i => new RevenueTransactionLineItemViewModel
                {
                    Description = i.ItemName ?? i.Description ?? i.ItemCode ?? string.Empty,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    Total = i.TotalAmount
                }).ToList(),
                PaymentSplits = bill.Payments
                    .Where(p => p.Status == PaymentStatus.Paid)
                    .OrderBy(p => p.PaymentDate).ThenBy(p => p.PaymentTime)
                    .Select(p => new RevenueTransactionPaymentSplitViewModel
                    {
                        Method = RevenueReportScope.MethodLabel(p.Method),
                        Amount = p.Amount,
                        Reference = p.ReferenceNumber ?? p.TransactionId ?? p.PaymentNumber
                    }).ToList(),
                InsuranceClaim = BuildInsuranceClaim(bill, claim)
            };
        }

        private static RevenueTransactionInsuranceClaimViewModel? BuildInsuranceClaim(Bill bill, InsuranceClaim? claim)
        {
            if (claim != null)
            {
                return new RevenueTransactionInsuranceClaimViewModel
                {
                    ProviderName = claim.InsuranceCompany?.Name ?? string.Empty,
                    ClaimedAmount = claim.ClaimAmount,
                    ApprovedAmount = claim.ApprovedAmount ?? 0,
                    Status = claim.Status.ToString()
                };
            }

            // Fall back to the insurance fields recorded on the bill itself (cashier flow).
            if (bill.InsuranceCompanyId == null) return null;

            return new RevenueTransactionInsuranceClaimViewModel
            {
                ProviderName = bill.InsuranceCompany?.Name ?? string.Empty,
                ClaimedAmount = bill.TotalAmount - bill.PatientCopayAmount,
                ApprovedAmount = bill.InsuranceApprovedAmount,
                Status = bill.InsurancePaidAmount > 0 ? "Settled" : bill.InsuranceApprovedAmount > 0 ? "Approved" : "Pending"
            };
        }
    }
}
