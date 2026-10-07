using PhysioBoo.Application.Queries.Patients;
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Queries.Laboratory;
using PhysioBoo.Application.ViewModels.Radiology;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Radiology.GetPatientHistory
{
    public sealed class GetRadiologyPatientHistoryQueryHandler : IRequestHandler<GetRadiologyPatientHistoryQuery, PagedResult<ImagingOrderRowViewModel>>
    {
        private readonly IPatientRepository _patientRepository;
        private readonly IImagingOrderRepository _imagingOrderRepository;
        private readonly IBedAssignmentRepository _bedAssignmentRepository;

        public GetRadiologyPatientHistoryQueryHandler(
            IPatientRepository patientRepository,
            IImagingOrderRepository imagingOrderRepository,
            IBedAssignmentRepository bedAssignmentRepository)
        {
            _patientRepository = patientRepository;
            _imagingOrderRepository = imagingOrderRepository;
            _bedAssignmentRepository = bedAssignmentRepository;
        }

        public async Task<PagedResult<ImagingOrderRowViewModel>> Handle(GetRadiologyPatientHistoryQuery request, CancellationToken ct)
        {
            Domain.Entities.PatientInformation.Patient? patient = await PatientLookup.FindAsync(_patientRepository, request.PatientKey, ct);
            if (patient == null)
            {
                return new PagedResult<ImagingOrderRowViewModel>(0, new List<ImagingOrderRowViewModel>(), 1, RadiologyWorkspace.DefaultPageSize);
            }

            List<ImagingOrder> orders = await _imagingOrderRepository
                .GetAllNoTracking(o => o.PatientId == patient.Id, includeProperties: RadiologyWorkspace.OrderIncludes)
                .OrderByDescending(o => o.CreatedAt)
                .Take(RadiologyWorkspace.DefaultPageSize)
                .AsSplitQuery()
                .ToListAsync(ct);

            Dictionary<Guid, string> wards = await LabWorkspace.LoadWardNamesAsync(_bedAssignmentRepository, new[] { patient.Id }, ct);
            List<ImagingOrderRowViewModel> rows = orders.Select(o => RadiologyWorkspace.ToOrderRow(o, wards)).ToList();

            return new PagedResult<ImagingOrderRowViewModel>(rows.Count, rows, 1, RadiologyWorkspace.DefaultPageSize);
        }
    }
}
