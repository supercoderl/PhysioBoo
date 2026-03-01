namespace PhysioBoo.Application.ViewModels.AppointmentTypes
{
    public sealed record UpdateAppointmentTypeViewModel
    (
        Guid Id,
        string Name,
        string? Code,
        string? Description,
        int DefaultDuration,
        int BufferTime,
        bool IsEmergency,
        bool RequiresPreparation,
        string? PreparationInstructions,
        bool IsFollowUp,
        decimal ConsultationFee,
        string? ColorCode,
        bool IsActive
    );
}
