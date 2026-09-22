using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.MedicalServices.DuplicateMedicalService
{
    public sealed class DuplicateMedicalServiceCommandHandler : CommandHandlerBase, IRequestHandler<DuplicateMedicalServiceCommand>
    {
        private readonly IMedicalServiceRepository _medicalServiceRepository;
        private readonly IUser _user;

        public DuplicateMedicalServiceCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IMedicalServiceRepository medicalServiceRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _medicalServiceRepository = medicalServiceRepository;
            _user = user;
        }

        public async Task Handle(DuplicateMedicalServiceCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            MedicalService? source = await _medicalServiceRepository.GetWithLinksAsync(request.SourceId, cancellationToken);

            if (source == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType, $"Service with Id {request.SourceId} not found.", ErrorCodes.ObjectNotFound));
                return;
            }

            string code = await NextAvailableCodeAsync(source.Code, cancellationToken);
            MedicalService copy = new MedicalService(
                request.NewId,
                code,
                $"{source.Name} (Copy)",
                source.ShortName,
                source.Description,
                ServiceStatus.Draft,
                source.Availability,
                source.BasePrice,
                source.Currency,
                source.VatIncluded,
                source.DurationMinutes,
                source.RequiresAppointment,
                source.RequiresReferral,
                source.PrimaryDoctorId,
                source.HospitalId,
                source.CategoryId,
                source.Tags
            );

            copy.SetTenantId(_user.GetTenantId());
            copy.SetCreatedBy(_user.GetUserId());
            copy.ReplaceDepartments(source.Departments.Select(d => d.DepartmentId));
            copy.ReplaceDoctors(source.Doctors.Select(d => d.DoctorId));

            SharedKernel.Results.DbResult<Guid> result = await _medicalServiceRepository.InsertAsync<MedicalService, Guid>(copy);

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType, $"Insert failed, please try again. Error: {result.Error}", ErrorCodes.CommitFailed));
            }
        }

        private async Task<string> NextAvailableCodeAsync(string baseCode, CancellationToken ct)
        {
            string candidate = $"{baseCode}-COPY";
            int n = 1;
            while (await _medicalServiceRepository.CodeExistsAsync(candidate, null, ct))
            {
                n++;
                candidate = $"{baseCode}-COPY{n}";
            }
            return candidate;
        }
    }
}