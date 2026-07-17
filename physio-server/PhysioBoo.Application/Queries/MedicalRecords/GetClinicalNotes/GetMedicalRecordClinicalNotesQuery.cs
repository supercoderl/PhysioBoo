using MediatR;
using PhysioBoo.Application.ViewModels.MedicalRecords;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.MedicalRecords.GetClinicalNotes
{
    public sealed record GetMedicalRecordClinicalNotesQuery(Guid PatientId) : IRequest<PagedResult<ClinicalNoteViewModel>>;
}
