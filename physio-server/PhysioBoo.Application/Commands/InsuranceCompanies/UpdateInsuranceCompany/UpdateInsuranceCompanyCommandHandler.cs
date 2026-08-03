using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.InsuranceCompanies.UpdateInsuranceCompany
{
    public sealed class UpdateInsuranceCompanyCommandHandler : CommandHandlerBase, IRequestHandler<UpdateInsuranceCompanyCommand>
    {
        private readonly IInsuranceCompanyRepository _insuranceCompanyRepository;

        public UpdateInsuranceCompanyCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IInsuranceCompanyRepository insuranceCompanyRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _insuranceCompanyRepository = insuranceCompanyRepository;
        }

        public async Task Handle(UpdateInsuranceCompanyCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Support.InsuranceCompany? insuranceCompany = await _insuranceCompanyRepository.GetByIdAsync(request.Id);

            if (insuranceCompany == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insurance company with Id {request.Id} not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            insuranceCompany.SetName(request.InsuranceCompany.Name);
            insuranceCompany.SetType(request.InsuranceCompany.Type);
            insuranceCompany.SetContactPerson(request.InsuranceCompany.ContactPerson);
            insuranceCompany.SetPhone(request.InsuranceCompany.Phone);
            insuranceCompany.SetEmail(request.InsuranceCompany.Email);
            insuranceCompany.SetAddress(request.InsuranceCompany.Address);
            insuranceCompany.SetWebsite(request.InsuranceCompany.Website);
            insuranceCompany.SetCashlessFacility(request.InsuranceCompany.CashlessFacility);
            insuranceCompany.SetReimbursementFacility(request.InsuranceCompany.ReimbursementFacility);
            insuranceCompany.SetNetworkHospitals(request.InsuranceCompany.NetworkHospitals);
            insuranceCompany.SetMaximumCoverageAmount(request.InsuranceCompany.MaximumCoverageAmount);
            insuranceCompany.SetClaimSettlementRatio(request.InsuranceCompany.ClaimSettlementRatio);
            insuranceCompany.SetAverageClaimSettlementTime(request.InsuranceCompany.AverageClaimSettlementTime);
            insuranceCompany.SetRequiredDocuments(request.InsuranceCompany.RequiredDocuments);
            insuranceCompany.SetTermAndConditions(request.InsuranceCompany.TermAndConditions);
            insuranceCompany.SetIsActive(request.InsuranceCompany.IsActive);

            await _insuranceCompanyRepository.UpdateTrackedAsync(insuranceCompany, ct);
        }
    }
}
