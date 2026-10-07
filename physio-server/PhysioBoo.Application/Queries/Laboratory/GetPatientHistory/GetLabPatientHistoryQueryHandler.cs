using PhysioBoo.Application.Queries.Patients;
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Laboratory;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Laboratory.GetPatientHistory
{
    public sealed class GetLabPatientHistoryQueryHandler : IRequestHandler<GetLabPatientHistoryQuery, PagedResult<LabOrderRowViewModel>>
    {
        private readonly IPatientRepository _patientRepository;
        private readonly ILabOrderRepository _labOrderRepository;
        private readonly IBedAssignmentRepository _bedAssignmentRepository;

        public GetLabPatientHistoryQueryHandler(
            IPatientRepository patientRepository,
            ILabOrderRepository labOrderRepository,
            IBedAssignmentRepository bedAssignmentRepository)
        {
            _patientRepository = patientRepository;
            _labOrderRepository = labOrderRepository;
            _bedAssignmentRepository = bedAssignmentRepository;
        }

        public async Task<PagedResult<LabOrderRowViewModel>> Handle(GetLabPatientHistoryQuery request, CancellationToken ct)
        {
            Domain.Entities.PatientInformation.Patient? patient = await PatientLookup.FindAsync(_patientRepository, request.PatientKey, ct);
            if (patient == null)
            {
                return new PagedResult<LabOrderRowViewModel>(0, new List<LabOrderRowViewModel>(), 1, LabWorkspace.DefaultPageSize);
            }

            List<LabOrder> orders = await _labOrderRepository
                .GetAllNoTracking(o => o.PatientId == patient.Id, includeProperties: LabWorkspace.OrderIncludes)
                .OrderByDescending(o => o.OrderDate)
                .ThenByDescending(o => o.OrderTime)
                .Take(LabWorkspace.DefaultPageSize)
                .AsSplitQuery()
                .ToListAsync(ct);

            Dictionary<Guid, string> wards = await LabWorkspace.LoadWardNamesAsync(_bedAssignmentRepository, new[] { patient.Id }, ct);

            List<LabOrderRowViewModel> rows = orders
                .Select(o => LabWorkspace.ToOrderRow(o, o.LabOrderItems.ToList(), wards))
                .ToList();

            return new PagedResult<LabOrderRowViewModel>(rows.Count, rows, 1, LabWorkspace.DefaultPageSize);
        }
    }
}
