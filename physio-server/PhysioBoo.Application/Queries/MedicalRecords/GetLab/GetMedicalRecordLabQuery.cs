using MediatR;
using PhysioBoo.Application.ViewModels.MedicalRecords;

namespace PhysioBoo.Application.Queries.MedicalRecords.GetLab
{
    public sealed record GetMedicalRecordLabQuery(Guid PatientId) : IRequest<LabViewModel?>;
}
