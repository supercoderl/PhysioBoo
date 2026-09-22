
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Errors;

using PhysioBoo.Domain.Interfaces.Repositories;


namespace PhysioBoo.Application.Commands.RetailCarts.ResumeCart
{
    public sealed class ResumeCartCommandHandler : CommandHandlerBase, IRequestHandler<ResumeCartCommand>
    {
        private readonly IRetailCartRepository _retailCartRepository;

        public ResumeCartCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IRetailCartRepository retailCartRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _retailCartRepository = retailCartRepository;
        }

        public async Task Handle(ResumeCartCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            RetailCart? cart = await _retailCartRepository.GetByIdAsync(request.CartId, ct: ct);

            if (cart == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Cart {request.CartId} not found.", ErrorCodes.ObjectNotFound));
                return;
            }

            cart.Resume();
            await _retailCartRepository.UpdateTrackedAsync(cart, ct);
        }
    }
}
