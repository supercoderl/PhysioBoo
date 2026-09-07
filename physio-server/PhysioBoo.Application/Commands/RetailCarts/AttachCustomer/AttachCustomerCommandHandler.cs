
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.RetailCarts.AttachCustomer
{
    public sealed class AttachCustomerCommandHandler : CommandHandlerBase, IRequestHandler<AttachCustomerCommand>
    {
        private readonly IRetailCartRepository _retailCartRepository;

        public AttachCustomerCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IRetailCartRepository retailCartRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _retailCartRepository = retailCartRepository;
        }

        public async Task Handle(AttachCustomerCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            RetailCart? cart = await _retailCartRepository.GetByIdAsync(request.CartId, ct: ct);

            if (cart == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Cart {request.CartId} not found.", ErrorCodes.ObjectNotFound));
                return;
            }

            cart.AttachCustomer(
                Enum.Parse<RetailCustomerType>(request.Customer.Type),
                request.Customer.PatientId,
                request.Customer.FullName,
                request.Customer.Phone,
                request.Customer.Mrn,
                request.Customer.InsuranceProvider,
                request.Customer.InsuranceCoverageAmount,
                request.Customer.LoyaltyPoints,
                request.Customer.PrescriptionReference,
                request.Customer.AllergyInformation
            );

            await _retailCartRepository.UpdateTrackedAsync(cart, ct);
        }
    }
}
