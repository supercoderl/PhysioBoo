using PhysioBoo.Domain.Entities.Theatre;
using PhysioBoo.SharedKernel.Results;

namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface ISurgeryCaseRepository : IRepository<SurgeryCase>
    {
        // Loads Patient -> Profile, Department, OperatingRoom, Team -> StaffUser -> Profile, Equipment, Checklist and Timeline.
        Task<SurgeryCase?> GetWithLinksAsync(Guid id, CancellationToken ct = default);

        // Saves the case together with the team, equipment, checklist and timeline rows added to it,
        // in one transaction (the Dapper-based InsertAsync ignores child collections: gotcha 1).
        Task<DbResult<Guid>> CreateWithChildrenAsync(SurgeryCase surgeryCase, CancellationToken ct = default);

        // Records that a case reached a stage: adds the timeline event, sets the case status and, when
        // roomStatus is given, the operating room status, all in one transaction. A stage that was already
        // recorded, or a cancelled case, is rejected. On failure, Error holds SurgeryStageOutOfOrder or CommitFailed.
        Task<DbResult<Guid>> AdvanceStageAsync(
            Guid surgeryCaseId,
            SurgeryTimelineStage stage,
            DateTime occurredAt,
            SurgeryStatus newStatus,
            OperatingRoomStatus? roomStatus,
            Guid tenantId,
            Guid userId,
            CancellationToken ct = default
        );
    }
}
