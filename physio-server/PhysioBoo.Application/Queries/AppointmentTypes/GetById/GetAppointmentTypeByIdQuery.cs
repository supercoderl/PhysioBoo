using MediatR;
using PhysioBoo.Application.ViewModels.AppointmentTypes;

namespace PhysioBoo.Application.Queries.AppointmentTypes.GetById
{
    public sealed record GetAppointmentTypeByIdQuery(Guid Id) : IRequest<AppointmentTypeViewModel?>;
}
