using MediatR;
using PhysioBoo.Application.ViewModels.MedicalRecords;

namespace PhysioBoo.Application.Queries.MedicalRecords.GetBillingSummary
{
    public sealed record GetMedicalRecordBillingQuery(Guid PatientId) : IRequest<BillingSummaryViewModel?>;
}
