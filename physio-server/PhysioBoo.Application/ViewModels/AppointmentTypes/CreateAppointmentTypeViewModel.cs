namespace PhysioBoo.Application.ViewModels.AppointmentTypes
{
    public sealed record CreateAppointmentTypeViewModel
    (
        Guid Id,
        string Name,
        string? Description,
        int DefaultDuration,
        int BufferTime,
        bool IsEmergency,
        bool RequiresPreparation,
        string? PreparationInstructions,
        bool IsFollowUp,
        decimal ConsultationFee,
        string? ColorCode
    );
}
