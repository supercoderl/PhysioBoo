
using PhysioBoo.Application.ViewModels.Bills;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Bills.CreateBill
{
    // Transactional header+items create (same lesson as module 8/9's CreatePrescription/
    // CheckoutCart) — replaces the old two-step create-bill-then-N-create-bill-item-calls flow.
    // NOTE ON ATOMICITY: same infrastructure limitation as CheckoutCartCommandHandler — this
    // codebase's repository layer commits each call individually, no cross-call transaction wrapper
    // exists yet.
    public sealed class CreateBillCommandHandler : CommandHandlerBase, IRequestHandler<CreateBillCommand>
    {
        private readonly IBillRepository _billRepository;
        private readonly IBillItemRepository _billItemRepository;
        private readonly IUser _user;
        private readonly ISys_SequenceTrackerRepository _sys_SequenceTrackerRepository;

        public CreateBillCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IBillRepository billRepository,
            IBillItemRepository billItemRepository,
            IUser user,
            ISys_SequenceTrackerRepository sys_SequenceTrackerRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _billRepository = billRepository;
            _billItemRepository = billItemRepository;
            _user = user;
            _sys_SequenceTrackerRepository = sys_SequenceTrackerRepository;
        }

        public async Task Handle(CreateBillCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            string newCode = await _sys_SequenceTrackerRepository.GenerateNextCodeAsync(nameof(Bill), ct);

            Bill newBill = new Bill(
                request.NewId,
                newCode,
                request.NewBill.PatientId,
                request.NewBill.AppointmentId,
                request.NewBill.Source,
                request.NewBill.HospitalId,
                request.NewBill.DepartmentId,
                request.NewBill.Type,
                request.NewBill.DueDate,
                request.NewBill.PaymentTerms,
                request.NewBill.InsuranceCompanyId,
                request.NewBill.InsuranceClaimNumber,
                request.NewBill.Notes,
                request.NewBill.TermsAndConditions
            );

            newBill.SetTenantId(_user.GetTenantId());
            newBill.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _billRepository.InsertAsync<Bill, Guid>(newBill);

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));

                return;
            }

            decimal subtotal = 0;
            decimal taxTotal = 0;

            foreach (CreateBillItemInput input in request.NewBill.Items)
            {
                decimal lineSubtotal = input.UnitPrice * input.Quantity;
                decimal lineTax = Math.Round(lineSubtotal * input.TaxPercentage / 100m, 2);
                decimal lineTotal = lineSubtotal + lineTax;

                BillItem item = new BillItem(
                    Guid.NewGuid(),
                    newBill.Id,
                    input.Type,
                    input.ItemCode,
                    input.ItemName,
                    input.Description,
                    input.UnitPrice,
                    lineTotal,
                    input.PerformedBy,
                    input.PerformedDate,
                    input.ReferenceId
                );
                item.SetQuantity(input.Quantity);
                item.SetTaxPercentage(input.TaxPercentage);
                item.SetTaxAmount(lineTax);
                item.SetIsInsuranceCovered(input.IsInsuranceCovered);
                item.SetTenantId(_user.GetTenantId());
                item.SetCreatedBy(_user.GetUserId());

                await _billItemRepository.InsertAsync(item);

                subtotal += lineSubtotal;
                taxTotal += lineTax;
            }

            decimal total = subtotal + taxTotal;

            newBill.UpdateAmounts(subtotal, taxTotal, 0, total, 0, total, 0, 0, 0);
            await _billRepository.UpdateTrackedAsync(newBill, ct);
        }
    }
}
