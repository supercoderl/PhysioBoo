using MediatR;
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.MedicalRecords;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.MedicalRecords.GetPatientAllergies
{
    public sealed class GetMedicalRecordPatientAllergiesQueryHandler : IRequestHandler<GetMedicalRecordPatientAllergiesQuery, PagedResult<PatientAllergyViewModel>>
    {
        private readonly IPatientAllergyRepository _patientAllergyRepository;

        public GetMedicalRecordPatientAllergiesQueryHandler(
            IPatientAllergyRepository patientAllergyRepository
        )
        {
            _patientAllergyRepository = patientAllergyRepository;
        }

        public async Task<PagedResult<PatientAllergyViewModel>> Handle(GetMedicalRecordPatientAllergiesQuery request, CancellationToken cancellationToken)
        {
            List<Domain.Entities.PatientInformation.PatientAllergy> allergies = await _patientAllergyRepository.GetAllNoTracking(
                filter: x => x.PatientId == request.PatientId
            ).ToListAsync();

            return new PagedResult<PatientAllergyViewModel>(0, allergies.Select(x => PatientAllergyViewModel.FromPatientAllergy(x)).ToList(), 1, 1);
        }
    }
}
