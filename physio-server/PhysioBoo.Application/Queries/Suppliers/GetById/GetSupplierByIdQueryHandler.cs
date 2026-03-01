using MediatR;
using PhysioBoo.Application.ViewModels.Suppliers;
using PhysioBoo.Domain.Entities.Support;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Queries.Suppliers.GetById
{
    public sealed class GetSupplierByIdQueryHandler : IRequestHandler<GetSupplierByIdQuery, SupplierViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly ISupplierRepository _supplierRepository;

        public GetSupplierByIdQueryHandler(
            IMediatorHandler bus,
            ISupplierRepository supplierRepository
        )
        {
            _bus = bus;
            _supplierRepository = supplierRepository;
        }

        public async Task<SupplierViewModel?> Handle(GetSupplierByIdQuery request, CancellationToken cancellationToken)
        {
            Supplier? supplier = await _supplierRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken);

            if (supplier == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetSupplierByIdQuery),
                    $"Supplier with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            return SupplierViewModel.FromSupplier(supplier);
        }
    }
}
