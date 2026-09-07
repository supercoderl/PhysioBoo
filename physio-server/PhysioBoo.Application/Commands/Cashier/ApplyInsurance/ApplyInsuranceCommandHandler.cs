
using PhysioBoo.Application.Extensions;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Cashier.ApplyInsurance
{
    public sealed class ApplyInsuranceCommandHandler : CommandHandlerBase, IRequestHandler<ApplyInsuranceCommand>
    {
        private readonly IBillRepository _billRepository;

        public ApplyInsuranceCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IBillRepository billRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _billRepository = billRepository;
        }

        public async Task Handle(ApplyInsuranceCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Bill? bill = await _billRepository.GetByIdAsync(request.InvoiceId, includeProperties: "BillItems,Payments", ct: ct);

            if (bill == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Invoice {request.InvoiceId} not found.", ErrorCodes.ObjectNotFound));
                return;
            }

            bill.SetInsuranceCompanyId(request.Insurance.InsuranceCompanyId);
            bill.SetInsuranceClaimNumber(request.Insurance.PolicyNo);
            bill.RecalculateAndApply(insuranceApprovedAmount: request.Insurance.CoverageAmount, insurancePaidAmount: request.Insurance.CoverageAmount);

            await _billRepository.UpdateTrackedAsync(bill, ct);
        }
    }
}
