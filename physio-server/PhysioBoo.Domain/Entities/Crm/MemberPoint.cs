using PhysioBoo.Domain.Entities.PatientInformation;

namespace PhysioBoo.Domain.Entities.Crm
{
    public class MemberPoint : TenantEntity
    {
        #region Core Table Member Point (6)
        public string MemberNumber { get; private set; }
        public Guid PatientId { get; private set; }
        public MembershipTier Tier { get; private set; }
        public MemberStatus Status { get; private set; }
        public int Points { get; private set; }
        public DateTime JoinedAt { get; private set; }

        public virtual Patient? Patient { get; private set; }
        public virtual ICollection<PointTransaction> PointTransactions { get; private set; } = new List<PointTransaction>();
        #endregion

        #region Constructor (6)
        public MemberPoint(
            Guid id,
            string memberNumber,
            Guid patientId,
            MembershipTier tier
        ) : base(id)
        {
            MemberNumber = memberNumber;
            PatientId = patientId;
            Tier = tier;
            Status = MemberStatus.Active;
            Points = 0;
            JoinedAt = TimeZoneHelper.GetLocalTimeNow();
        }
        #endregion

        #region Setter Methods (6)
        public void SetMemberNumber(string memberNumber) { MemberNumber = memberNumber; }
        public void SetPatientId(Guid patientId) { PatientId = patientId; }
        public void SetTier(MembershipTier tier) { Tier = tier; }
        public void SetStatus(MemberStatus status) { Status = status; }
        public void SetPoints(int points) { Points = points; }
        public void SetJoinedAt(DateTime joinedAt) { JoinedAt = joinedAt; }
        #endregion
    }
}
