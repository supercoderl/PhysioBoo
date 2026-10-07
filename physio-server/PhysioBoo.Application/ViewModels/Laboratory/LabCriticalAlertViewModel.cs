using PhysioBoo.Domain.Entities.LaboratoryImaging;

namespace PhysioBoo.Application.ViewModels.Laboratory
{
    public sealed record LabCriticalAlertViewModel(
        Guid Id,
        string Type,
        string Severity,
        string Description,
        string SuggestedAction,
        string? PatientName,
        string? OrderNumber,
        bool Acknowledged,
        DateTime RaisedAt
    )
    {
        public static LabCriticalAlertViewModel FromEntity(LabAlert a)
        {
            return new LabCriticalAlertViewModel(
                a.Id,
                a.Type.ToString(),
                a.Severity.ToString(),
                a.Description,
                a.SuggestedAction,
                a.PatientName,
                a.OrderNumber,
                a.Acknowledged,
                a.RaisedAt
            );
        }
    }
}
