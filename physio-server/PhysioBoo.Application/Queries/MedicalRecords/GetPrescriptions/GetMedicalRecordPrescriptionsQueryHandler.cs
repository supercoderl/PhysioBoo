using MediatR;
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.MedicalRecords;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.MedicalRecords.GetPrescriptions
{
    public sealed class GetMedicalRecordPrescriptionsQueryHandler : IRequestHandler<GetMedicalRecordPrescriptionsQuery, PagedResult<PrescriptionViewModel>>
    {
        private readonly IPrescriptionRepository _prescriptionRepository;

        public GetMedicalRecordPrescriptionsQueryHandler(
            IPrescriptionRepository prescriptionRepository
        )
        {
            _prescriptionRepository = prescriptionRepository;
        }

        public async Task<PagedResult<PrescriptionViewModel>> Handle(GetMedicalRecordPrescriptionsQuery request, CancellationToken cancellationToken)
        {
            List<Domain.Entities.Clinical.Prescription> prescriptions = await _prescriptionRepository.GetAllNoTracking(
                filter: x => x.PatientId.Equals(request.PatientId),
                includeProperties: "PrescriptionItems"
            ).ToListAsync(cancellationToken);

            return new PagedResult<PrescriptionViewModel>(0, prescriptions.Select(x => PrescriptionViewModel.FromPrescription(x)).ToList(), 1, 1);
        }
    }
}
