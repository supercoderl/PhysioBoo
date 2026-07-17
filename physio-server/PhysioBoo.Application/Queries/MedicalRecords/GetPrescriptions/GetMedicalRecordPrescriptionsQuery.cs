using MediatR;
using PhysioBoo.Application.ViewModels.MedicalRecords;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.MedicalRecords.GetPrescriptions
{
    public sealed record GetMedicalRecordPrescriptionsQuery(Guid PatientId) : IRequest<PagedResult<PrescriptionViewModel>>;
}
