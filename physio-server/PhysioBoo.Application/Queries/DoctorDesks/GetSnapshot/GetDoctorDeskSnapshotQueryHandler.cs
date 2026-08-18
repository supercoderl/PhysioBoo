using MediatR;
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.DoctorDesks;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Queries.DoctorDesks.GetSnapshot
{
    public sealed class GetDoctorDeskSnapshotQueryHandler : IRequestHandler<GetDoctorDeskSnapshotQuery, DoctorDeskSnapshotViewModel?>
    {
        private readonly IDoctorRepository _doctorRepository;
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IMediatorHandler _bus;

        public GetDoctorDeskSnapshotQueryHandler(
            IDoctorRepository doctorRepository,
            IAppointmentRepository appointmentRepository,
            IMediatorHandler bus
        )
        {
            _doctorRepository = doctorRepository;
            _appointmentRepository = appointmentRepository;
            _bus = bus;
        }

        public async Task<DoctorDeskSnapshotViewModel?> Handle(GetDoctorDeskSnapshotQuery request, CancellationToken ct)
        {
            Domain.Entities.MedicalStaff.Doctor? doctor = await _doctorRepository.GetByUserIdAsync(request.UserId, ct);

            if (doctor == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetDoctorDeskSnapshotQuery),
                    "Doctor not found for the given user ID.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            DateOnly today = DateOnly.FromDateTime(TimeZoneHelper.GetLocalTimeNow());

            IQueryable<Domain.Entities.Operation.Appointment> q = _appointmentRepository.GetAllNoTracking();

            List<Domain.Entities.Operation.Appointment> appointments = await q
                .Include(a => a.Patient).ThenInclude(p => p!.Profile)
                .Include(a => a.AppointmentType)
                .Where(a =>
                    a.DoctorId == doctor.Id &&
                    a.ScheduledDate == today &&
                    (a.AppointmentStatus == AppointmentStatus.CheckedIn ||
                     a.AppointmentStatus == AppointmentStatus.InProgress ||
                     a.AppointmentStatus == AppointmentStatus.Completed))
                .OrderBy(a => a.CheckedInAt)
                .ToListAsync(ct);

            return DoctorDeskSnapshotViewModel.FromEntity(doctor, appointments);
        }
    }
}
