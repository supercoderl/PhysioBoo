using MediatR;
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.MedicalRecords;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.MedicalRecords.GetBillingSummary
{
    public sealed class GetMedicalRecordBillingQueryHandler : IRequestHandler<GetMedicalRecordBillingQuery, BillingSummaryViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly IBillRepository _billRepository;
        private readonly IPaymentRepository _paymentRepository;

        public GetMedicalRecordBillingQueryHandler(
            IMediatorHandler bus,
            IBillRepository billRepository,
            IPaymentRepository paymentRepository
        )
        {
            _bus = bus;
            _billRepository = billRepository;
            _paymentRepository = paymentRepository;
        }

        public async Task<BillingSummaryViewModel?> Handle(GetMedicalRecordBillingQuery request, CancellationToken cancellationToken)
        {
            List<Domain.Entities.Operation.Bill> bills = await _billRepository.GetAllNoTracking(
                filter: x => x.PatientId == request.PatientId,
                orderBy: null,
                includeProperties: "Payments"
            ).ToListAsync(cancellationToken);

            string currency = bills
                .Select(x => x.Currency)
                .Distinct()
                .SingleOrDefault() ?? "USD";
            List<Guid> billIds = bills.Select(x => x.Id).ToList();
            List<Domain.Entities.Operation.Payment> recentPayments = await _paymentRepository
                .GetAllNoTracking(x => billIds.Contains(x.BillId))
                .OrderByDescending(x => x.PaymentDate)
                .Take(5)
                .ToListAsync(cancellationToken);

            return BillingSummaryViewModel.FromEntity(
                currency,
                bills.Sum(x => x.TotalAmount),
                bills.Sum(x => x.PaidAmount),
                bills.Sum(x => x.InsurancePaidAmount),
                bills.Sum(x => x.OutstandingAmount),
                bills.Select(x => BillingSummaryViewModel.BillRow.FromBill(x)).ToList(),
                recentPayments.Select(x => BillingSummaryViewModel.PaymentRow.FromPayment(x)).ToList()
            );
        }
    }
}
