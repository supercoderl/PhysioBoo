using MediatR;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Shared.Events.Doctors;

namespace PhysioBoo.Application.Commands.Doctors.CreateDoctor
{
    public sealed class CreateDoctorCommandHandler : CommandHandlerBase, IRequestHandler<CreateDoctorCommand>
    {
        private readonly IDoctorRepository _doctorRepository;

        public CreateDoctorCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IDoctorRepository doctorRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _doctorRepository = doctorRepository;
        }

        public async Task Handle(CreateDoctorCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var result = await _doctorRepository.InsertAsync<Doctor, Guid>(new Doctor(
                request.Id,
                request.NewDoctor.EmployeeId,
                request.NewDoctor.MedicalLicenseNumber,
                request.NewDoctor.MedicalLicenseExpiry,
                request.NewDoctor.MedicalLicenseIssuingAuthority,
                request.NewDoctor.PrimarySpecialtyId,
                request.NewDoctor.Bio,
                request.NewDoctor.About,
                request.NewDoctor.Archivements,
                request.NewDoctor.ResearchInterests,
                request.NewDoctor.CancellationPolicy,
                request.NewDoctor.BankAccountDetails,
                request.NewDoctor.PanNumber,
                request.NewDoctor.Gstin,
                request.NewDoctor.TerminationDate,
                request.NewDoctor.VerificationDate,
                request.NewDoctor.VerifiedBy
            ));

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));

                return;
            }

            await Bus.RaiseEventAsync(new DoctorCreatedEvent(result.Id));
        }
    }
}
