
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.SharedKernel.Results;

namespace PhysioBoo.Application.Commands.RetailCarts.CreateCart
{
    public sealed class CreateCartCommandHandler : CommandHandlerBase, IRequestHandler<CreateCartCommand>
    {
        private readonly IRetailCartRepository _retailCartRepository;
        private readonly IUser _user;

        public CreateCartCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IRetailCartRepository retailCartRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _retailCartRepository = retailCartRepository;
            _user = user;
        }

        public async Task Handle(CreateCartCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            RetailCart cart = new RetailCart(
                request.NewCart.Id,
                string.IsNullOrWhiteSpace(request.NewCart.Name) ? "New Sale" : request.NewCart.Name,
                request.NewCart.HospitalId
            );

            cart.SetTenantId(_user.GetTenantId());
            cart.SetCreatedBy(_user.GetUserId());

            DbResult<Guid> result = await _retailCartRepository.InsertAsync<RetailCart, Guid>(cart);

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));
            }
        }
    }
}
