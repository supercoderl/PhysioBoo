using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Patients
{
    public static class PatientLookup
    {
        /// <summary>Finds a patient (with Profile) by id (GUID) or medical record number.</summary>
        public static async Task<Patient?> FindAsync(IPatientRepository patients, string patientKey, CancellationToken ct)
        {
            string key = patientKey.Trim();
            if (Guid.TryParse(key, out Guid id))
            {
                return await patients.GetAllNoTracking(p => p.Id == id, includeProperties: "Profile").FirstOrDefaultAsync(ct);
            }

            return await patients.GetAllNoTracking(p => p.PatientNumber == key, includeProperties: "Profile").FirstOrDefaultAsync(ct);
        }
    }
}
