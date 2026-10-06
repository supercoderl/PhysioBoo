using Microsoft.EntityFrameworkCore.Storage;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Infrastructure.Database;
using PhysioBoo.SharedKernel.Results;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class BedRepository : BaseRepository<Bed>, IBedRepository
    {
        private readonly ApplicationDbContext _context;

        public BedRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Bed?> GetWithLinksAsync(Guid id, CancellationToken ct = default)
        {
            return await DbSet
                .Include(b => b.Ward)
                    .ThenInclude(w => w!.Department)
                .Include(b => b.CurrentAssignment)
                    .ThenInclude(a => a!.Patient)
                        .ThenInclude(p => p!.Profile)
                .FirstOrDefaultAsync(b => b.Id == id, ct);
        }

        public async Task<DbResult<Guid>> AssignPatientAsync(
            Guid bedId,
            Guid patientId,
            Admission? newAdmission,
            DateTime? expectedDischargeDate,
            string? notes,
            string? assignedByName,
            Guid tenantId,
            Guid userId,
            CancellationToken ct = default)
        {
            DbResult<Guid>? result = null;

            // The context uses a retrying execution strategy, so a manual transaction must run inside it.
            IExecutionStrategy strategy = _context.Database.CreateExecutionStrategy();

            try
            {
                await strategy.ExecuteAsync(async () =>
                {
                    // A retry re-runs this delegate: drop anything tracked by a failed attempt.
                    _context.ChangeTracker.Clear();

                    await using IDbContextTransaction transaction = await _context.Database.BeginTransactionAsync(ct);

                    bool patientHasOpenStay = await _context.BedAssignments
                        .AnyAsync(a => a.PatientId == patientId && a.DischargedAt == null, ct);
                    if (patientHasOpenStay)
                    {
                        await transaction.RollbackAsync(ct);
                        result = DbResult<Guid>.Fail(DomainErrorCodes.Bed.PatientAlreadyAssigned);
                        return;
                    }

                    // One atomic statement claims the bed, so two staff can never book the same bed.
                    int claimed = await DbSet
                        .Where(b => b.Id == bedId && b.Status == BedStatus.Available)
                        .ExecuteUpdateAsync(s => s.SetProperty(b => b.Status, BedStatus.Occupied), ct);

                    if (claimed == 0)
                    {
                        await transaction.RollbackAsync(ct);
                        bool bedExists = await DbSet.AnyAsync(b => b.Id == bedId, ct);
                        result = DbResult<Guid>.Fail(bedExists ? DomainErrorCodes.Bed.NotAvailable : ErrorCodes.ObjectNotFound);
                        return;
                    }

                    if (newAdmission != null)
                    {
                        _context.Admissions.Add(newAdmission);
                    }

                    BedAssignment assignment = new BedAssignment(
                        Guid.NewGuid(),
                        bedId,
                        patientId,
                        newAdmission?.Id,
                        expectedDischargeDate,
                        notes,
                        assignedByName
                    );
                    assignment.SetTenantId(tenantId);
                    assignment.SetCreatedBy(userId);
                    _context.BedAssignments.Add(assignment);

                    // The assignment must exist before the bed can point at it.
                    await _context.SaveChangesAsync(ct);

                    await DbSet
                        .Where(b => b.Id == bedId)
                        .ExecuteUpdateAsync(s => s.SetProperty(b => b.CurrentAssignmentId, (Guid?)assignment.Id), ct);

                    await transaction.CommitAsync(ct);

                    result = DbResult<Guid>.Ok(assignment.Id);
                });
            }
            catch (Exception)
            {
                _context.ChangeTracker.Clear();
                return DbResult<Guid>.Fail(ErrorCodes.CommitFailed);
            }

            return result ?? DbResult<Guid>.Fail(ErrorCodes.CommitFailed);
        }

        public async Task<DbResult<Guid>> DischargeAsync(
            Guid bedId,
            DateTime dischargedAt,
            string? notes,
            CancellationToken ct = default)
        {
            DbResult<Guid>? result = null;

            IExecutionStrategy strategy = _context.Database.CreateExecutionStrategy();

            try
            {
                await strategy.ExecuteAsync(async () =>
                {
                    _context.ChangeTracker.Clear();

                    await using IDbContextTransaction transaction = await _context.Database.BeginTransactionAsync(ct);

                    var openStay = await _context.BedAssignments
                        .Where(a => a.BedId == bedId && a.DischargedAt == null)
                        .Select(a => new { a.Id, a.AdmissionId })
                        .FirstOrDefaultAsync(ct);

                    if (openStay == null)
                    {
                        await transaction.RollbackAsync(ct);
                        bool bedExists = await DbSet.AnyAsync(b => b.Id == bedId, ct);
                        result = DbResult<Guid>.Fail(bedExists ? DomainErrorCodes.Bed.NotOccupied : ErrorCodes.ObjectNotFound);
                        return;
                    }

                    Guid assignmentId = openStay.Id;
                    Guid? admissionId = openStay.AdmissionId;

                    await _context.BedAssignments
                        .Where(a => a.Id == assignmentId)
                        .ExecuteUpdateAsync(s => s
                            .SetProperty(a => a.DischargedAt, (DateTime?)dischargedAt)
                            .SetProperty(a => a.Notes, a => notes ?? a.Notes), ct);

                    await DbSet
                        .Where(b => b.Id == bedId)
                        .ExecuteUpdateAsync(s => s
                            .SetProperty(b => b.Status, BedStatus.Available)
                            .SetProperty(b => b.CurrentAssignmentId, (Guid?)null), ct);

                    // A stay that belongs to an admission ends that admission as well.
                    if (admissionId.HasValue)
                    {
                        Guid linkedAdmissionId = admissionId.Value;
                        await _context.Admissions
                            .Where(a => a.Id == linkedAdmissionId && a.Status == AdmissionRecordStatus.Admitted)
                            .ExecuteUpdateAsync(s => s
                                .SetProperty(a => a.Status, AdmissionRecordStatus.Discharged)
                                .SetProperty(a => a.DischargedAt, (DateTime?)dischargedAt)
                                .SetProperty(a => a.DischargeNotes, notes), ct);
                    }

                    await transaction.CommitAsync(ct);

                    result = DbResult<Guid>.Ok(assignmentId);
                });
            }
            catch (Exception)
            {
                _context.ChangeTracker.Clear();
                return DbResult<Guid>.Fail(ErrorCodes.CommitFailed);
            }

            return result ?? DbResult<Guid>.Fail(ErrorCodes.CommitFailed);
        }
    }
}
