using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.SharedKernel.Results;

namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface IBedRepository : IRepository<Bed>
    {
        // Loads Ward -> Department and CurrentAssignment -> Patient -> Profile.
        Task<Bed?> GetWithLinksAsync(Guid id, CancellationToken ct = default);

        // Atomically claims an available bed and opens a stay. When newAdmission is given it is
        // created in the same transaction. Returns the new assignment id. On failure, Error holds an
        // error code (ObjectNotFound, Bed.NotAvailable, Bed.PatientAlreadyAssigned, CommitFailed).
        Task<DbResult<Guid>> AssignPatientAsync(
            Guid bedId,
            Guid patientId,
            Admission? newAdmission,
            DateTime? expectedDischargeDate,
            string? notes,
            string? assignedByName,
            Guid tenantId,
            Guid userId,
            CancellationToken ct = default
        );

        // Atomically closes the bed's open stay, frees the bed and, if the stay belongs to an
        // admission, discharges that admission too. Returns the closed assignment id. On failure,
        // Error holds an error code (ObjectNotFound, Bed.NotOccupied, CommitFailed).
        Task<DbResult<Guid>> DischargeAsync(
            Guid bedId,
            DateTime dischargedAt,
            string? notes,
            CancellationToken ct = default
        );
    }
}
