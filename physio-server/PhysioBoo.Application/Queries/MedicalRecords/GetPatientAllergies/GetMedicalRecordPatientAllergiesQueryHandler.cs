
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

        public async Task<PagedResult<PatientAllergyViewModel>> Handle(GetMedicalRecordPatientAllergiesQuery request, CancellationToken ct)
        {
            List<Domain.Entities.PatientInformation.PatientAllergy> allergies = await _patientAllergyRepository.GetAllNoTracking(
                filter: x => x.PatientId == request.PatientId
            ).ToListAsync();

            return new PagedResult<PatientAllergyViewModel>(
                allergies.Count(),
                allergies.Select(x => PatientAllergyViewModel.FromPatientAllergy(x)).ToList(),
                1,
                allergies.Count() == 0 ? 1 : allergies.Count()
            );
        }
    }
}
