using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Suppliers.DeleteSupplier
{
    public sealed class DeleteSupplierCommandHandler : CommandHandlerBase, IRequestHandler<DeleteSupplierCommand>
    {
        private readonly ISupplierRepository _supplierRepository;

        public DeleteSupplierCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ISupplierRepository supplierRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _supplierRepository = supplierRepository;
        }

        public async Task Handle(DeleteSupplierCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Support.Supplier? supplier = await _supplierRepository.GetByIdAsync(request.Id);

            if (supplier == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Supplier not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            _supplierRepository.SoftDeleteSingle(
                supplier,
                request.IsHard,
                ct
            );

            await CommitAsync();
        }
    }
}
