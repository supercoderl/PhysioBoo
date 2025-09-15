using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.Operation
{
    public class AppointmentType : Entity
    {
        #region Core Appointment Type Table (13)
        public string Name { get; private set; }
        public string? Code { get; private set; }
        public string? Description { get; private set; }
        public int DefaultDuration { get; private set; } // in minutes
        public int BufferTime { get; private set; } // in minutes
        public bool IsEmergency { get; private set; }
        public bool RequiresPreparation { get; private set; }
        public string? PreparationInstructions { get; private set; }
        public bool IsFollowUp { get; private set; }
        public decimal ConsultationFee { get; private set; }
        public string? ColorCode { get; private set; }
        public bool IsActive { get; private set; }
        public DateTime CreatedAt { get; private set; }

        [InverseProperty("AppointmentType")]
        public virtual ICollection<Appointment> Appointments { get; private set; } = new List<Appointment>();
        #endregion

        #region Constructor (13)
        public AppointmentType(
            Guid id,
            string name,
            string? code,
            string? description,
            string? preparationInstructions,
            string? colorCode
        ) : base(id)
        {
            Name = name;
            Code = code;
            Description = description;
            DefaultDuration = 30;
            BufferTime = 10;
            IsEmergency = false;
            RequiresPreparation = false;
            PreparationInstructions = preparationInstructions;
            IsFollowUp = false;
            ConsultationFee = 0;
            ColorCode = colorCode;
            IsActive = true;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
        }
        #endregion

        #region Setter Methods (13)
        public void SetName(string name) { Name = name; }
        public void SetCode(string? code) { Code = code; }
        public void SetDescription(string? description) { Description = description; }
        public void SetDefaultDuration(int defaultDuration) { DefaultDuration = defaultDuration; }
        public void SetBufferTime(int bufferTime) { BufferTime = bufferTime; }
        public void SetIsEmergency(bool isEmergency) { IsEmergency = isEmergency; }
        public void SetRequiresPreparation(bool requiresPreparation) { RequiresPreparation = requiresPreparation; }
        public void SetPreparationInstructions(string? preparationInstructions) { PreparationInstructions = preparationInstructions; }
        public void SetIsFollowUp(bool isFollowUp) { IsFollowUp = isFollowUp; }
        public void SetConsultationFee(decimal consultationFee) { ConsultationFee = consultationFee; }
        public void SetColorCode(string? colorCode) { ColorCode = colorCode; }
        public void SetIsActive(bool isActive) { IsActive = isActive; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        #endregion
    }
}
