using PhysioBoo.Domain.Entities.Core;

using PhysioBoo.Domain.Entities.MedicalStaff;

namespace PhysioBoo.Domain.Entities.Clinical
{
    public class PrescriptionTemplate : TenantEntity
    {
        #region Core Prescription Template Table (4)
        public Guid DoctorId { get; private set; }
        public string Name { get; private set; }
        public string? Description { get; private set; }
        public bool IsActive { get; private set; }

        public virtual User? Creator { get; private set; }
        public virtual User? Updater { get; private set; }
        public virtual Doctor? Doctor { get; private set; }
        public virtual HospitalGroup? HospitalGroup { get; private set; }

        public virtual ICollection<PrescriptionTemplateItem> PrescriptionTemplateItems { get; private set; } = new List<PrescriptionTemplateItem>();
        #endregion

        #region Constructor (4)
        public PrescriptionTemplate(
            Guid id,
            Guid doctorId,
            string name,
            string? description
        ) : base(id)
        {
            DoctorId = doctorId;
            Name = name;
            Description = description;
            IsActive = true;
        }
        #endregion

        #region Setter Methods (4)
        public void SetDoctorId(Guid doctorId)
        {
            DoctorId = doctorId;
        }

        public void SetName(string name)
        {
            Name = name;
        }

        public void SetDescription(string? description)
        {
            Description = description;
        }

        public void SetIsActive(bool isActive)
        {
            IsActive = isActive;
        }
        #endregion
    }
}
