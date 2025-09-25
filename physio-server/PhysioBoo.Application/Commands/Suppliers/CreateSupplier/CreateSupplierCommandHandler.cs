using MediatR;
using PhysioBoo.Domain.Entities.Support;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Suppliers.CreateSupplier
{
    public sealed class CreateSupplierCommandHandler : CommandHandlerBase, IRequestHandler<CreateSupplierCommand>
    {
        private readonly ISupplierRepository _supplierRepository;

        public CreateSupplierCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ISupplierRepository supplierRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _supplierRepository = supplierRepository;
        }

        public async Task Handle(CreateSupplierCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var result = await _supplierRepository.InsertAsync<Supplier, Guid>(new Supplier(
                request.NewSupplier.Id,
                request.NewSupplier.SupplierName,
                request.NewSupplier.SupplierCode,
                request.NewSupplier.Type,
                request.NewSupplier.ContactPerson,
                request.NewSupplier.Phone,
                request.NewSupplier.AlternatePhone,
                request.NewSupplier.Email,
                request.NewSupplier.Website,
                request.NewSupplier.Address,
                request.NewSupplier.City,
                request.NewSupplier.StateProvince,
                request.NewSupplier.PostalCode,
                request.NewSupplier.Country,
                request.NewSupplier.BusinessRegistrationNumber,
                request.NewSupplier.TaxIdentificationNumber,
                request.NewSupplier.GstNumber,
                request.NewSupplier.PanNumber,
                request.NewSupplier.DrugLicenseNumber,
                request.NewSupplier.DrugLicenseExpiry,
                request.NewSupplier.FdaRegistrationNumber,
                request.NewSupplier.IsoCertification,
                request.NewSupplier.PaymentTerms,
                request.NewSupplier.BankAccountDetails,
                request.NewSupplier.LastOrderDate
            ));

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));

                return;
            }
        }
    }
}
