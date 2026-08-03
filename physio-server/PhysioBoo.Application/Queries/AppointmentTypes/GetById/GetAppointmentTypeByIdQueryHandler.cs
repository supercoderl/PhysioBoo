using MediatR;
using PhysioBoo.Application.ViewModels.AppointmentTypes;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Queries.AppointmentTypes.GetById
{
    public sealed class GetAppointmentTypeByIdQueryHandler : IRequestHandler<GetAppointmentTypeByIdQuery, AppointmentTypeViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly IAppointmentTypeRepository _appointmentTypeRepository;

        public GetAppointmentTypeByIdQueryHandler(
            IMediatorHandler bus,
            IAppointmentTypeRepository appointmentTypeRepository
        )
        {
            _bus = bus;
            _appointmentTypeRepository = appointmentTypeRepository;
        }

        public async Task<AppointmentTypeViewModel?> Handle(GetAppointmentTypeByIdQuery request, CancellationToken ct)
        {
            AppointmentType? appointmentType = await _appointmentTypeRepository.GetByIdAsync(request.Id, ct: ct);

            if (appointmentType == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetAppointmentTypeByIdQuery),
                    $"Medical specialty with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            return AppointmentTypeViewModel.FromAppointmentType(appointmentType);
        }
    }
}
