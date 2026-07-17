using MediatR;
using PhysioBoo.Application.ViewModels.MedicalRecords;

namespace PhysioBoo.Application.Queries.MedicalRecords.GetHistory
{
    public sealed record GetMedicalRecordHistoryQuery(Guid PatientId) : IRequest<HistoricalSummaryViewModel?>;
}
