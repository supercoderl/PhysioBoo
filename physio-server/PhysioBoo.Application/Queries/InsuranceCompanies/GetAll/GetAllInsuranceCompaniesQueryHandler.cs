using MediatR;
using PhysioBoo.Application.ViewModels.InsuranceCompanies;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Support;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.InsuranceCompanies.GetAll
{
    public sealed class GetAllInsuranceCompaniesQueryHandler : IRequestHandler<GetAllInsuranceCompaniesQuery, PagedResult<InsuranceCompanyViewModel>>
    {
        private readonly IInsuranceCompanyRepository _insuranceCompanyRepository;
        private readonly ISortingExpressionProvider<InsuranceCompanyViewModel, InsuranceCompany> _sortingExpressionProvider;

        public GetAllInsuranceCompaniesQueryHandler(
            IInsuranceCompanyRepository insuranceCompanyRepository,
            ISortingExpressionProvider<InsuranceCompanyViewModel, InsuranceCompany> sortingExpressionProvider
        )
        {
            _insuranceCompanyRepository = insuranceCompanyRepository;
            _sortingExpressionProvider = sortingExpressionProvider;
        }

        public async Task<PagedResult<InsuranceCompanyViewModel>> Handle(GetAllInsuranceCompaniesQuery q, CancellationToken ct)
        {
            InsuranceCompaniesSearchSpec spec = new InsuranceCompaniesSearchSpec(q, _sortingExpressionProvider);

            PagedResult<InsuranceCompany> paged = await _insuranceCompanyRepository.ListAsync(
                spec,
                q.Request.PageNumber,
                q.Request.PageSize,
                ct
            );

            // Map to view model
            List<InsuranceCompanyViewModel> items = paged.Items.Select(ms => InsuranceCompanyViewModel.FromInsuranceCompany(ms)).ToList();
            return new PagedResult<InsuranceCompanyViewModel>(paged.TotalCount, items, q.Request.PageNumber, q.Request.PageSize);
        }
    }
}
