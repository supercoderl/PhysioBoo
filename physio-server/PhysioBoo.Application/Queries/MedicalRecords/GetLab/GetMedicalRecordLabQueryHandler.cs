using MediatR;
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.MedicalRecords;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.MedicalRecords.GetLab
{
    public sealed class GetMedicalRecordLabQueryHandler : IRequestHandler<GetMedicalRecordLabQuery, LabViewModel?>
    {
        private readonly ILabOrderItemRepository _labOrderItemRepository;
        private readonly ILabReportRepository _labReportRepository;

        public GetMedicalRecordLabQueryHandler(
            ILabOrderItemRepository labOrderItemRepository,
            ILabReportRepository labReportRepository
        )
        {
            _labOrderItemRepository = labOrderItemRepository;
            _labReportRepository = labReportRepository;
        }

        public async Task<LabViewModel?> Handle(GetMedicalRecordLabQuery request, CancellationToken ct)
        {
            List<Domain.Entities.LaboratoryImaging.LabOrderItem> results = await _labOrderItemRepository.GetAllNoTracking(
                filter: x => x.LabOrder != null ? x.LabOrder.PatientId.Equals(request.PatientId) : false,
                includeProperties: "LabOrder"
            ).ToListAsync(ct);

            List<Domain.Entities.LaboratoryImaging.LabReport> reports = await _labReportRepository.GetAllNoTracking(
                filter: x => x.PatientId == request.PatientId,
                includeProperties: ""
            ).ToListAsync(ct);

            return LabViewModel.FromEntity(
                results.Select(x => LabViewModel.LabResultRow.FromEntity(x)).ToList(),
                reports.Select(x => LabViewModel.LabReportRow.FromEntity(x)).ToList()
            );
        }
    }
}
