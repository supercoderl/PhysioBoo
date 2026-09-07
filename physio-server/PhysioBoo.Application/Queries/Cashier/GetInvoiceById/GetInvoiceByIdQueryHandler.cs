
using PhysioBoo.Application.ViewModels.Cashier;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Cashier.GetInvoiceById
{
    public sealed class GetInvoiceByIdQueryHandler : IRequestHandler<GetInvoiceByIdQuery, CashierInvoiceViewModel?>
    {
        private readonly IBillRepository _billRepository;

        public GetInvoiceByIdQueryHandler(IBillRepository billRepository)
        {
            _billRepository = billRepository;
        }

        public async Task<CashierInvoiceViewModel?> Handle(GetInvoiceByIdQuery request, CancellationToken ct)
        {
            Bill? bill = await _billRepository.GetByIdAsync(
                request.InvoiceId,
                includeProperties: "Patient.Profile,Department,Appointment.Doctor.User.Profile,BillItems",
                ct: ct
            );

            return bill == null ? null : CashierInvoiceViewModel.FromBill(bill);
        }
    }
}
