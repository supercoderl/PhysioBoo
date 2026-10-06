using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Domain.Entities.Theatre
{
    public class SurgeryTeamMember : TenantEntity
    {
        #region Core SurgeryTeamMember Table (4)
        public Guid SurgeryCaseId { get; private set; }
        public Guid StaffUserId { get; private set; }
        public SurgicalTeamRole Role { get; private set; }
        public TeamMemberAvailability Availability { get; private set; }

        public virtual SurgeryCase? SurgeryCase { get; private set; }
        public virtual User? StaffUser { get; private set; }
        #endregion

        #region Constructor (4)
        public SurgeryTeamMember(
            Guid id,
            Guid surgeryCaseId,
            Guid staffUserId,
            SurgicalTeamRole role
        ) : base(id)
        {
            SurgeryCaseId = surgeryCaseId;
            StaffUserId = staffUserId;
            Role = role;
            Availability = TeamMemberAvailability.Assigned;
        }
        #endregion

        #region Setter Methods (4)
        public void SetStaffUserId(Guid staffUserId) { StaffUserId = staffUserId; }
        public void SetRole(SurgicalTeamRole role) { Role = role; }
        public void SetAvailability(TeamMemberAvailability availability) { Availability = availability; }
        #endregion
    }
}
