using MediatR;
using PhysioBoo.Application.ViewModels.InsuranceCompanies;
using PhysioBoo.Domain.Entities.Support;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Queries.InsuranceCompanies.GetById
{
    public sealed class GetInsuranceCompanyByIdQueryHandler : IRequestHandler<GetInsuranceCompanyByIdQuery, InsuranceCompanyViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly IInsuranceCompanyRepository _insuranceCompanyRepository;

        public GetInsuranceCompanyByIdQueryHandler(
            IMediatorHandler bus,
            IInsuranceCompanyRepository insuranceCompanyRepository
        )
        {
            _bus = bus;
            _insuranceCompanyRepository = insuranceCompanyRepository;
        }

        public async Task<InsuranceCompanyViewModel?> Handle(GetInsuranceCompanyByIdQuery request, CancellationToken cancellationToken)
        {
            InsuranceCompany? insuranceCompany = await _insuranceCompanyRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken);

            if (insuranceCompany == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetInsuranceCompanyByIdQuery),
                    $"Insurance company with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            return InsuranceCompanyViewModel.FromInsuranceCompany(insuranceCompany);
        }
    }
}
