using PhysioBoo.Domain.Entities.Operation;

namespace PhysioBoo.Application.ViewModels.AppointmentTypes
{
    public sealed class AppointmentTypeViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
        public string? Description { get; set; }
        public int DefaultDuration { get; set; }
        public int BufferTime { get; set; }
        public bool IsEmergency { get; set; }
        public bool RequiresPreparation { get; set; }
        public string? PreparationInstructions { get; set; }
        public bool IsFollowUp { get; set; }
        public decimal ConsultationFee { get; set; }
        public string? ColorCode { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

        public static AppointmentTypeViewModel FromAppointmentType(AppointmentType appointmentType)
        {
            return new AppointmentTypeViewModel
            {
                Id = appointmentType.Id,
                Name = appointmentType.Name,
                Code = appointmentType.Code,
                Description = appointmentType.Description,
                DefaultDuration = appointmentType.DefaultDuration,
                BufferTime = appointmentType.BufferTime,
                IsEmergency = appointmentType.IsEmergency,
                RequiresPreparation = appointmentType.RequiresPreparation,
                PreparationInstructions = appointmentType.PreparationInstructions,
                IsFollowUp = appointmentType.IsFollowUp,
                ConsultationFee = appointmentType.ConsultationFee,
                ColorCode = appointmentType.ColorCode,
                IsActive = appointmentType.IsActive,
                CreatedAt = appointmentType.CreatedAt
            };
        }
    }
}
