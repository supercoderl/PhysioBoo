using MediatR;
using PhysioBoo.Application.ViewModels.DoctorDesks;

namespace PhysioBoo.Application.Queries.DoctorDesks.GetSnapshot
{
    public sealed record GetDoctorDeskSnapshotQuery(Guid UserId) : IRequest<DoctorDeskSnapshotViewModel?>;
}
