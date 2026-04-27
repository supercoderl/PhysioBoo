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
        private readonly ISys_SequenceTrackerRepository _sys_SequenceTrackerRepository;

        public CreateSupplierCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ISupplierRepository supplierRepository,
            ISys_SequenceTrackerRepository sys_SequenceTrackerRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _supplierRepository = supplierRepository;
            _sys_SequenceTrackerRepository = sys_SequenceTrackerRepository;
        }

        public async Task Handle(CreateSupplierCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            string newCode = await _sys_SequenceTrackerRepository.GenerateNextCodeAsync(nameof(Supplier), cancellationToken);

            Supplier newSupplier = new Supplier(
                request.NewId,
                request.NewSupplier.SupplierName,
                newCode,
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
            );

            newSupplier.SetGmpCertified(request.NewSupplier.GmpCertified);
            newSupplier.SetCreditLimit(request.NewSupplier.CreditLimit);
            newSupplier.SetLeadTimeDays(request.NewSupplier.LeadTimeDays);
            newSupplier.SetMinimumOrderValue(request.NewSupplier.MinimumOrderValue);
            newSupplier.SetDeliveryReliabilityScore(request.NewSupplier.DeliveryReliabilityScore);
            newSupplier.SetQualityRating(request.NewSupplier.QualityRating);
            newSupplier.SetServiceRating(request.NewSupplier.ServiceRating);
            newSupplier.SetTotalOrders(request.NewSupplier.TotalOrders);
            newSupplier.SetTotalPurchaseValue(request.NewSupplier.TotalPurchaseValue);

            SharedKernel.Results.DbResult<Guid> result = await _supplierRepository.InsertAsync<Supplier, Guid>(newSupplier);

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
