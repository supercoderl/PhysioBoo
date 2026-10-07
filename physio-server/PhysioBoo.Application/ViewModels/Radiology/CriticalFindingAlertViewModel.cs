using PhysioBoo.Domain.Entities.LaboratoryImaging;

namespace PhysioBoo.Application.ViewModels.Radiology
{
    public sealed record CriticalFindingAlertViewModel(
        Guid Id,
        string Type,
        string Severity,
        string Description,
        string? PatientName,
        string? OrderNumber,
        bool Acknowledged,
        bool Notified,
        DateTime RaisedAt
    )
    {
        public static CriticalFindingAlertViewModel FromEntity(RadiologyAlert a)
        {
            return new CriticalFindingAlertViewModel(
                a.Id,
                a.Type.ToString(),
                a.Severity.ToString(),
                a.Description,
                a.PatientName,
                a.OrderNumber,
                a.Acknowledged,
                a.Notified,
                a.RaisedAt
            );
        }
    }
}
