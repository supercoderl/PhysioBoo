using MediatR;
using PhysioBoo.Application.ViewModels.MedicalRecords;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.MedicalRecords.GetImagings
{
    public sealed record GetMedicalRecordImagingsQuery(Guid PatientId) : IRequest<PagedResult<ImagingStudyViewModel>>;
}
