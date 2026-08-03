using MediatR;
using PhysioBoo.Application.ViewModels.Doctors;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Doctors.GetAll
{
    public sealed class GetAllDoctorsQueryHandler : IRequestHandler<GetAllDoctorsQuery, PagedResult<DoctorViewModel>>
    {
        private readonly IDoctorRepository _doctorRepository;
        private readonly ISortingExpressionProvider<DoctorViewModel, Doctor> _sortingExpressionProvider;

        public GetAllDoctorsQueryHandler(
            IDoctorRepository doctorRepository,
            ISortingExpressionProvider<DoctorViewModel, Doctor> sortingExpressionProvider
        )
        {
            _doctorRepository = doctorRepository;
            _sortingExpressionProvider = sortingExpressionProvider;
        }

        public async Task<PagedResult<DoctorViewModel>> Handle(GetAllDoctorsQuery q, CancellationToken ct)
        {
            DoctorsSearchSpec spec = new DoctorsSearchSpec(q, _sortingExpressionProvider);

            PagedResult<Doctor> paged = await _doctorRepository.ListAsync(
                spec,
                q.Request.PageNumber,
                q.Request.PageSize,
                ct
            );

            // Map to view model
            List<DoctorViewModel> items = paged.Items.Select(d => DoctorViewModel.FromDoctor(d)).ToList();
            return new PagedResult<DoctorViewModel>(paged.TotalCount, items, q.Request.PageNumber, q.Request.PageSize);
        }
    }
}
