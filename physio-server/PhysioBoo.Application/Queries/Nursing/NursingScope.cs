using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Nursing
{
    internal static class NursingScope
    {
        // The signed-in nurse's patients for a shift: assignments of that shift's date whose admission is still active.
        public static async Task<List<NursingAssignment>> GetMyAssignmentsAsync(
            INursingAssignmentRepository assignmentRepository,
            Guid nurseUserId,
            ShiftCode shift,
            DateTime now,
            string includeProperties,
            CancellationToken cancellationToken)
        {
            DateOnly shiftDate = ShiftClock.ShiftDateFor(shift, now);

            return await assignmentRepository
                .GetAllNoTracking(
                    a => a.NurseUserId == nurseUserId
                         && a.Shift == shift
                         && a.ShiftDate == shiftDate
                         && a.Admission!.Status == AdmissionRecordStatus.Admitted,
                    includeProperties: includeProperties)
                .ToListAsync(cancellationToken);
        }
    }
}
