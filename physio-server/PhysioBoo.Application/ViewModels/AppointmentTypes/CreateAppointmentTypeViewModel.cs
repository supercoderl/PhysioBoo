namespace PhysioBoo.Application.ViewModels.AppointmentTypes
{
    public sealed record CreateAppointmentTypeViewModel
    (
        Guid Id,
        string Name,
        string? Code,
        string? Description,
        string? PreparationInstructions,
        string? ColorCode
    );
}
