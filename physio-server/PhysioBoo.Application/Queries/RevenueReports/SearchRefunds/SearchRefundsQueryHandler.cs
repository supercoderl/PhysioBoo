using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.RevenueReports;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.RevenueReports.SearchRefunds
{
    public sealed class SearchRefundsQueryHandler : IRequestHandler<SearchRefundsQuery, PagedResult<RefundRecordViewModel>>
    {
        private readonly IPaymentRepository _paymentRepository;

        public SearchRefundsQueryHandler(IPaymentRepository paymentRepository)
        {
            _paymentRepository = paymentRepository;
        }

        public async Task<PagedResult<RefundRecordViewModel>> Handle(SearchRefundsQuery q, CancellationToken ct)
        {
            RevenueReportFilter filter = RevenueReportScope.OrDefault(q.Request.Filter);
            (DateOnly from, DateOnly to) = RevenueReportScope.Range(filter);
            (int pageNumber, int pageSize) = RevenueReportScope.Page(q.Request);

            IQueryable<Payment> query = RevenueReportScope.RefundsIn(
                _paymentRepository.GetAllNoTracking(includeProperties: "Bill.Department,Patient.Profile,Processor.Profile"),
                filter, from, to
            );

            int totalCount = await query.CountAsync(ct);

            List<Payment> payments = await query
                .OrderByDescending(p => p.RefundDate)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            List<RefundRecordViewModel> items = payments.Select(p => new RefundRecordViewModel
            {
                RefundId = p.Id,
                BillNo = p.Bill?.BillNumber ?? string.Empty,
                PatientName = p.Patient?.Profile?.FullName ?? string.Empty,
                Department = p.Bill?.Department?.Name ?? string.Empty,
                Reason = p.RefundReason ?? string.Empty,
                Amount = p.RefundAmount,
                Date = p.RefundDate ?? p.PaymentDate.ToDateTime(p.PaymentTime),
                ProcessedBy = p.Processor?.Profile?.FullName ?? string.Empty
            }).ToList();

            return new PagedResult<RefundRecordViewModel>(totalCount, items, pageNumber, pageSize);
        }
    }
}
