using MediatR;
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.MedicalRecords;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.MedicalRecords.GetImagings
{
    public sealed class GetMedicalRecordImagingsQueryHandler : IRequestHandler<GetMedicalRecordImagingsQuery, PagedResult<ImagingStudyViewModel>>
    {
        private readonly IImagingOrderRepository _imagingOrderRepository;
        private readonly IImagingReportRepository _imagingReportRepository;

        public GetMedicalRecordImagingsQueryHandler(
            IImagingOrderRepository imagingOrderRepository,
            IImagingReportRepository imagingReportRepository
        )
        {
            _imagingOrderRepository = imagingOrderRepository;
            _imagingReportRepository = imagingReportRepository;
        }

        public async Task<PagedResult<ImagingStudyViewModel>> Handle(GetMedicalRecordImagingsQuery q, CancellationToken cancellationToken)
        {
            List<Domain.Entities.LaboratoryImaging.ImagingReport> imagingReports = await _imagingReportRepository.GetAllNoTracking(
                filter: x => x.PatientId == q.PatientId,
                includeProperties: "ImagingOrder"
            ).ToListAsync();

            return new PagedResult<ImagingStudyViewModel>(0, imagingReports.Select(x => ImagingStudyViewModel.FromImaging(x)).ToList(), 1, 1);
        }
    }
}
