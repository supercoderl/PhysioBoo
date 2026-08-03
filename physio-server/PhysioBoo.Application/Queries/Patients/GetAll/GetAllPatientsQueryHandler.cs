using MediatR;
using PhysioBoo.Application.ViewModels.Patients;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Patients.GetAll
{
    public sealed class GetAllPatientsQueryHandler : IRequestHandler<GetAllPatientsQuery, PagedResult<PatientViewModel>>
    {
        private readonly IPatientRepository _patientRepository;
        private readonly ISortingExpressionProvider<PatientViewModel, Patient> _sortingExpressionProvider;

        public GetAllPatientsQueryHandler(
            IPatientRepository patientRepository,
            ISortingExpressionProvider<PatientViewModel, Patient> sortingExpressionProvider
        )
        {
            _patientRepository = patientRepository;
            _sortingExpressionProvider = sortingExpressionProvider;
        }

        public async Task<PagedResult<PatientViewModel>> Handle(GetAllPatientsQuery q, CancellationToken ct)
        {
            PatientsSearchSpec spec = new PatientsSearchSpec(q, _sortingExpressionProvider);

            PagedResult<Patient> paged = await _patientRepository.ListAsync(
                spec,
                q.Request.PageNumber,
                q.Request.PageSize,
                ct
            );

            // Map to view model
            List<PatientViewModel> items = paged.Items.Select(p => PatientViewModel.FromPatient(p)).ToList();
            return new PagedResult<PatientViewModel>(paged.TotalCount, items, q.Request.PageNumber, q.Request.PageSize);
        }
    }
}
