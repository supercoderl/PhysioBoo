using NpgsqlTypes;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.System
{
    public class Sys_SequenceTracker : Entity
    {
        #region Core SequenceTracker Table (10)
        public string EntityType { get; private set; }
        public string Prefix { get; private set; }
        public string? UseDateFormating { get; private set; }
        public int SequenceLength { get; private set; }
        public int CurrentSequence { get; private set; }
        public string? Suffix { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public Guid CreatedBy { get; private set; }
        public DateTime? UpdatedAt { get; private set; }
        public Guid? UpdatedBy { get; private set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public NpgsqlTsVector? SearchVector { get; private set; }

        [ForeignKey(nameof(CreatedBy))]
        [InverseProperty(nameof(User.CreatedSequenceTrackers))]
        public virtual User? Creator { get; private set; }

        [ForeignKey(nameof(UpdatedBy))]
        [InverseProperty(nameof(User.UpdatedSequenceTrackers))]
        public virtual User? Updater { get; private set; }
        #endregion

        #region Constructor (10)
        public Sys_SequenceTracker(
            Guid id,
            string entityType,
            string prefix,
            string? useDateFormating,
            string? suffix,
            Guid createdBy
        ) : base(id)
        {
            EntityType = entityType;
            Prefix = prefix;
            UseDateFormating = useDateFormating;
            SequenceLength = 6;
            CurrentSequence = 0;
            Suffix = suffix;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
            CreatedBy = createdBy;
        }
        #endregion

        #region Setter Methods (10)
        public void SetEntityType(string entityType) { EntityType = entityType; }
        public void SetPrefix(string prefix) { Prefix = prefix; }
        public void SetUseDateFormating(string? useDateFormating) { UseDateFormating = useDateFormating; }
        public void SetSequenceLength(int sequenceLength) { SequenceLength = sequenceLength; }
        public void SetCurrentSequence(int currentSequence) { CurrentSequence = currentSequence; }
        public void SetSuffix(string? suffix) { Suffix = suffix; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        public void SetCreatedBy(Guid createdBy) { CreatedBy = createdBy; }
        public void SetUpdatedAt(DateTime? updatedAt) { UpdatedAt = updatedAt; }
        public void SetUpdatedBy(Guid? updatedBy) { UpdatedBy = updatedBy; }
        #endregion

        public void GenerateNext(DateTime currentDateFormatted)
        {
            if (!string.IsNullOrEmpty(UseDateFormating) &&
                UpdatedAt.HasValue &&
                UpdatedAt.Value.Date != currentDateFormatted.Date)
            {
                SetCurrentSequence(1);
                SetUpdatedAt(currentDateFormatted);
            }
            else
            {
                SetCurrentSequence(CurrentSequence + 1);
            }
        }
    }
}
