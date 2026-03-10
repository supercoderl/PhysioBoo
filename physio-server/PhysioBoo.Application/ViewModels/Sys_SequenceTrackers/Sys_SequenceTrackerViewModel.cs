using PhysioBoo.Domain.Entities.System;

namespace PhysioBoo.Application.ViewModels.Sys_SequenceTrackers
{
    public sealed class Sys_SequenceTrackerViewModel
    {
        public Guid Id { get; set; }
        public string EntityType { get; set; } = string.Empty;
        public string Prefix { get; set; } = string.Empty;
        public string? UseDateFormating { get; set; }
        public int SequenceLength { get; set; }
        public int CurrentSequence { get; set; }
        public string? Suffix { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedBy { get; set; }

        public static Sys_SequenceTrackerViewModel FromSys_SequenceTracker(Sys_SequenceTracker sys_SequenceTracker)
        {
            return new Sys_SequenceTrackerViewModel
            {
                Id = sys_SequenceTracker.Id,
                EntityType = sys_SequenceTracker.EntityType,
                Prefix = sys_SequenceTracker.Prefix,
                UseDateFormating = sys_SequenceTracker.UseDateFormating,
                SequenceLength = sys_SequenceTracker.SequenceLength,
                CurrentSequence = sys_SequenceTracker.CurrentSequence,
                Suffix = sys_SequenceTracker.Suffix,
                CreatedAt = sys_SequenceTracker.CreatedAt,
                CreatedBy = sys_SequenceTracker.CreatedBy,
                UpdatedAt = sys_SequenceTracker.UpdatedAt,
                UpdatedBy = sys_SequenceTracker.UpdatedBy
            };
        }
    }
}
