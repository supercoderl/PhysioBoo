using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Suppliers.UpdateSupplier
{
    public sealed class UpdateSupplierCommandHandler : CommandHandlerBase, IRequestHandler<UpdateSupplierCommand>
    {
        private readonly ISupplierRepository _supplierRepository;

        public UpdateSupplierCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ISupplierRepository supplierRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _supplierRepository = supplierRepository;
        }

        public async Task Handle(UpdateSupplierCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Support.Supplier? supplier = await _supplierRepository.GetByIdAsync(request.Supplier.Id);

            if (supplier == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Supplier with Id {request.Supplier.Id} not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            supplier.SetSupplierName(request.Supplier.SupplierName);
            supplier.SetSupplierCode(request.Supplier.SupplierCode);
            supplier.SetType(request.Supplier.Type);
            supplier.SetContactPerson(request.Supplier.ContactPerson);
            supplier.SetPhone(request.Supplier.Phone);
            supplier.SetAlternatePhone(request.Supplier.AlternatePhone);
            supplier.SetEmail(request.Supplier.Email);
            supplier.SetWebsite(request.Supplier.Website);
            supplier.SetAddress(request.Supplier.Address);
            supplier.SetCity(request.Supplier.City);
            supplier.SetStateProvince(request.Supplier.StateProvince);
            supplier.SetPostalCode(request.Supplier.PostalCode);
            supplier.SetCountry(request.Supplier.Country);
            supplier.SetBusinessRegistrationNumber(request.Supplier.BusinessRegistrationNumber);
            supplier.SetTaxIdentificationNumber(request.Supplier.TaxIdentificationNumber);
            supplier.SetGstNumber(request.Supplier.GstNumber);
            supplier.SetPanNumber(request.Supplier.PanNumber);
            supplier.SetDrugLicenseNumber(request.Supplier.DrugLicenseNumber);
            supplier.SetDrugLicenseExpiry(request.Supplier.DrugLicenseExpiry);
            supplier.SetIsoCertification(request.Supplier.IsoCertification);
            supplier.SetFdaRegistrationNumber(request.Supplier.FdaRegistrationNumber);
            supplier.SetGmpCertified(request.Supplier.GmpCertified);
            supplier.SetPaymentTerms(request.Supplier.PaymentTerms);
            supplier.SetCreditLimit(request.Supplier.CreditLimit);
            supplier.SetCurrency(request.Supplier.Currency);
            supplier.SetBankAccountDetails(request.Supplier.BankAccountDetails);
            supplier.SetLeadTimeDays(request.Supplier.LeadTimeDays);
            supplier.SetMinimumOrderValue(request.Supplier.MinimumOrderValue);
            supplier.SetDeliveryReliabilityScore(request.Supplier.DeliveryReliabilityScore);
            supplier.SetQualityRating(request.Supplier.QualityRating);
            supplier.SetServiceRating(request.Supplier.ServiceRating);
            supplier.SetTotalOrders(request.Supplier.TotalOrders);
            supplier.SetTotalPurchaseValue(request.Supplier.TotalPurchaseValue);

            await _supplierRepository.UpdateTrackedAsync(supplier, cancellationToken);
        }
    }
}
