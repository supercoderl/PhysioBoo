using MediatR;
using PhysioBoo.Domain.Entities.Support;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PhysioBoo.Application.Commands.InsuranceCompanies.CreateInsuranceCompany
{
    public sealed class CreateInsuranceCompanyCommandHandler : CommandHandlerBase, IRequestHandler<CreateInsuranceCompanyCommand>
    {
        private readonly IInsuranceCompanyRepository _insuranceCompanyRepository;

        public CreateInsuranceCompanyCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IInsuranceCompanyRepository insuranceCompanyRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _insuranceCompanyRepository = insuranceCompanyRepository;
        }

        public async Task Handle(CreateInsuranceCompanyCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var result = await _insuranceCompanyRepository.InsertAsync<InsuranceCompany, Guid>(new InsuranceCompany(
                request.NewInsuranceCompany.Id,
                request.NewInsuranceCompany.Name,
                request.NewInsuranceCompany.Code,
                request.NewInsuranceCompany.Type,
                request.NewInsuranceCompany.ContactPerson,
                request.NewInsuranceCompany.Phone,
                request.NewInsuranceCompany.Email,
                request.NewInsuranceCompany.Address,
                request.NewInsuranceCompany.Website,
                request.NewInsuranceCompany.NetworkHospitals,
                request.NewInsuranceCompany.MaximumCoverageAmount,
                request.NewInsuranceCompany.ClaimSettlementRatio,
                request.NewInsuranceCompany.AverageClaimSettlementTime,
                request.NewInsuranceCompany.RequiredDocuments,
                request.NewInsuranceCompany.TermAndConditions
            ));

            if(!result.Success)
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
