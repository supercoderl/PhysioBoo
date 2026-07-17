using MediatR;
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.MedicalRecords;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.MedicalRecords.GetDiagnoses
{
    public sealed class GetMedicalRecordDiagnosesQueryHandler : IRequestHandler<GetMedicalRecordDiagnosesQuery, PagedResult<DiagnosisViewModel>>
    {
        private readonly IPatientMedicalHistoryRepository _patientMedicalHistoryRepository;

        public GetMedicalRecordDiagnosesQueryHandler(
            IPatientMedicalHistoryRepository patientMedicalHistoryRepository
        )
        {
            _patientMedicalHistoryRepository = patientMedicalHistoryRepository;
        }

        public async Task<PagedResult<DiagnosisViewModel>> Handle(GetMedicalRecordDiagnosesQuery request, CancellationToken cancellationToken)
        {
            List<Domain.Entities.PatientInformation.PatientMedicalHistory> histories = await _patientMedicalHistoryRepository.GetAllNoTracking(
                filter: x => x.PatientId == request.PatientId,
                includeProperties: "DiagnosedDoctor.User.Profile"
            ).ToListAsync();

            return new PagedResult<DiagnosisViewModel>(0, histories.Select(x => DiagnosisViewModel.FromPatientMedicalHistory(x)).ToList(), 1, 1);
        }
    }
}
