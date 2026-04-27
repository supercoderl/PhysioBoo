using MediatR;
using PhysioBoo.Application.ViewModels.Patients;

namespace PhysioBoo.Application.Queries.Patients.GetById
{
    public sealed record GetPatientByIdQuery(Guid Id) : IRequest<PatientViewModel?>;
}
