
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Cashier;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Cashier.SearchInvoices
{
    public sealed class SearchInvoicesQueryHandler : IRequestHandler<SearchInvoicesQuery, PagedResult<CashierInvoiceViewModel>>
    {
        private readonly IBillRepository _billRepository;

        public SearchInvoicesQueryHandler(IBillRepository billRepository)
        {
            _billRepository = billRepository;
        }

        public async Task<PagedResult<CashierInvoiceViewModel>> Handle(SearchInvoicesQuery q, CancellationToken ct)
        {
            PagedRequest<CashierInvoiceFilter> request = q.Request;

            IQueryable<Bill> query = _billRepository
                .GetAllNoTracking(includeProperties: "Patient.Profile,Department,Appointment.Doctor.User.Profile,BillItems")
                .OrderByDescending(b => b.BillDate);

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string term = request.Search.Trim().ToLower();
                query = query.Where(b => b.BillNumber.ToLower().Contains(term)
                    || (b.Patient != null && b.Patient.PatientNumber.ToLower().Contains(term)))
                    .OrderByDescending(b => b.BillDate);
            }

            if (request.Filter != null)
            {
                if (!string.IsNullOrWhiteSpace(request.Filter.Status) && Enum.TryParse(request.Filter.Status, out PaymentStatus status))
                    query = query.Where(b => b.PaymentStatus == status).OrderByDescending(b => b.BillDate);

                if (request.Filter.DateFrom != null)
                    query = query.Where(b => b.BillDate >= request.Filter.DateFrom.Value).OrderByDescending(b => b.BillDate);

                if (request.Filter.DateTo != null)
                    query = query.Where(b => b.BillDate <= request.Filter.DateTo.Value).OrderByDescending(b => b.BillDate);

                if (request.Filter.DepartmentId != null)
                    query = query.Where(b => b.DepartmentId == request.Filter.DepartmentId.Value).OrderByDescending(b => b.BillDate);
            }

            int totalCount = await query.CountAsync(ct);
            int pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
            int pageSize = request.PageSize <= 0 ? 20 : request.PageSize;

            List<Bill> pageBills = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            List<CashierInvoiceViewModel> items = pageBills.Select(b => CashierInvoiceViewModel.FromBill(b)).ToList();
            return new PagedResult<CashierInvoiceViewModel>(totalCount, items, pageNumber, pageSize);
        }
    }
}
