using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.MedicalStaff
{
    public class DoctorSchedule : Entity
    {
        #region Core Doctor Schedule Table (18)
        public Guid DoctorId { get; private set; }
        public Guid HospitalId { get; private set; }
        public Guid DepartmentId { get; private set; }
        public int DayOfWeek { get; private set; } // 0 = Sunday, 6 = Saturday
        public TimeOnly StartTime { get; private set; }
        public TimeOnly EndTime { get; private set; }
        public TimeOnly? BreakStartTime { get; private set; }
        public TimeOnly? BreakEndTime { get; private set; }
        public int MaxPatientsPerSlot { get; private set; }
        public int SlotDuration { get; private set; } // in minutes
        public bool IsAvailable { get; private set; } = true;
        public ScheduleType ScheduleType { get; private set; }
        public DateTime EffectiveFrom { get; private set; }
        public DateTime? EffectiveTo { get; private set; }
        public decimal ConsultationFee { get; private set; }
        public string? Notes { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }

        [ForeignKey("DoctorId")]
        [InverseProperty("Schedules")]
        public virtual Doctor? Doctor { get; private set; }

        [ForeignKey("HospitalId")]
        [InverseProperty("DoctorSchedules")]
        public virtual Hospital? Hospital { get; private set; }

        [ForeignKey("DepartmentId")]
        [InverseProperty("DoctorSchedules")]
        public virtual Department? Department { get; private set; }
        #endregion

        #region Constructor (18)
        public DoctorSchedule(
            Guid id,
            Guid doctorId,
            Guid hospitalId,
            Guid departmentId,
            int dayOfWeek,
            TimeOnly startTime,
            TimeOnly endTime,
            TimeOnly? breakStartTime,
            TimeOnly? breakEndTime,
            ScheduleType scheduleType,
            DateTime? effectiveTo,
            decimal consultationFee,
            string? notes
        ) : base(id)
        {
            DoctorId = doctorId;
            HospitalId = hospitalId;
            DepartmentId = departmentId;
            DayOfWeek = dayOfWeek;
            StartTime = startTime;
            EndTime = endTime;
            BreakStartTime = breakStartTime;
            BreakEndTime = breakEndTime;
            MaxPatientsPerSlot = 1;
            SlotDuration = 30;
            IsAvailable = true;
            ScheduleType = scheduleType;
            EffectiveFrom = TimeZoneHelper.GetLocalTimeNow();
            EffectiveTo = effectiveTo;
            ConsultationFee = consultationFee;
            Notes = notes;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
            UpdatedAt = null;
        }
        #endregion

        #region Setter Methods (18)
        public void SetDoctorId(Guid doctorId) { DoctorId = doctorId; }
        public void SetHospitalId(Guid hospitalId) { HospitalId = hospitalId; }
        public void SetDepartmentId(Guid departmentId) { DepartmentId = departmentId; }
        public void SetDayOfWeek(int dayOfWeek) { DayOfWeek = dayOfWeek; }
        public void SetStartTime(TimeOnly startTime) { StartTime = startTime; }
        public void SetEndTime(TimeOnly endTime) { EndTime = endTime; }
        public void SetBreakStartTime(TimeOnly? breakStartTime) { BreakStartTime = breakStartTime; }
        public void SetBreakEndTime(TimeOnly? breakEndTime) { BreakEndTime = breakEndTime; }
        public void SetMaxPatientsPerSlot(int maxPatientsPerSlot) { MaxPatientsPerSlot = maxPatientsPerSlot; }
        public void SetSlotDuration(int slotDuration) { SlotDuration = slotDuration; }
        public void SetIsAvailable(bool isAvailable) { IsAvailable = isAvailable; }
        public void SetScheduleType(ScheduleType scheduleType) { ScheduleType = scheduleType; }
        public void SetEffectiveFrom(DateTime effectiveFrom) { EffectiveFrom = effectiveFrom; }
        public void SetEffectiveTo(DateTime? effectiveTo) { EffectiveTo = effectiveTo; }
        public void SetConsultationFee(decimal consultationFee) { ConsultationFee = consultationFee; }
        public void SetNotes(string? notes) { Notes = notes; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        public void SetUpdatedAt(DateTime? updatedAt) { UpdatedAt = updatedAt; }
        #endregion
    }
}
