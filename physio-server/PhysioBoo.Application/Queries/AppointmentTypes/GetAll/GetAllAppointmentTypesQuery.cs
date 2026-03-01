using MediatR;
using PhysioBoo.Application.ViewModels.AppointmentTypes;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.AppointmentTypes.GetAll
{
    public sealed record GetAllAppointmentTypesQuery(
            PagedRequest<AppointmentTypeFilter> Request
        ) : IRequest<PagedResult<AppointmentTypeViewModel>>;
}
