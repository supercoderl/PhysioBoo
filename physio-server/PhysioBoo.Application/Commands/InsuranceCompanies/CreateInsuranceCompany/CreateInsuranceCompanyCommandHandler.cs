using MediatR;
using PhysioBoo.Domain.Entities.Support;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.InsuranceCompanies.CreateInsuranceCompany
{
    public sealed class CreateInsuranceCompanyCommandHandler : CommandHandlerBase, IRequestHandler<CreateInsuranceCompanyCommand>
    {
        private readonly IInsuranceCompanyRepository _insuranceCompanyRepository;
        private readonly ISys_SequenceTrackerRepository _sys_SequenceTrackerRepository;

        public CreateInsuranceCompanyCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IInsuranceCompanyRepository insuranceCompanyRepository,
            ISys_SequenceTrackerRepository sys_SequenceTrackerRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _insuranceCompanyRepository = insuranceCompanyRepository;
            _sys_SequenceTrackerRepository = sys_SequenceTrackerRepository;
        }

        public async Task Handle(CreateInsuranceCompanyCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            string newCode = await _sys_SequenceTrackerRepository.GenerateNextCodeAsync(nameof(InsuranceCompany), cancellationToken);

            InsuranceCompany newInsuranceCompany = new InsuranceCompany(
                request.NewId,
                request.NewInsuranceCompany.Name,
                newCode,
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
            );

            newInsuranceCompany.SetCashlessFacility(request.NewInsuranceCompany.CashlessFacility);
            newInsuranceCompany.SetReimbursementFacility(request.NewInsuranceCompany.ReimbursementFacility);

            SharedKernel.Results.DbResult<Guid> result = await _insuranceCompanyRepository.InsertAsync<InsuranceCompany, Guid>(newInsuranceCompany);

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
