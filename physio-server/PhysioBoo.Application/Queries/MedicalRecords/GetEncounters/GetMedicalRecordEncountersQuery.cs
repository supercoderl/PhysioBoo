using MediatR;
using PhysioBoo.Application.ViewModels.MedicalRecords;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.MedicalRecords.GetEncounters
{
    public sealed record GetMedicalRecordEncountersQuery(Guid PatientId) : IRequest<PagedResult<EncounterViewModel>>;
}
