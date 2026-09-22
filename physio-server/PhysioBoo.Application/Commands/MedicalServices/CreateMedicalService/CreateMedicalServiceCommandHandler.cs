using PhysioBoo.Application.ViewModels.MedicalServices;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.MedicalServices.CreateMedicalService
{
    public sealed class CreateMedicalServiceCommandHandler : CommandHandlerBase, IRequestHandler<CreateMedicalServiceCommand>
    {
        private readonly IMedicalServiceRepository _medicalServiceRepository;
        private readonly IUser _user;

        public CreateMedicalServiceCommandHandler(
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

        public async Task Handle(CreateMedicalServiceCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            CreateMedicalServiceViewModel vm = request.NewMedicalService;

            if (await _medicalServiceRepository.CodeExistsAsync(vm.Code, null, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"A service with code '{vm.Code}' already exists.",
                    DomainErrorCodes.MedicalService.CodeAlreadyExists
                ));
                return;
            }

            if (!Enum.TryParse(vm.Status, true, out ServiceStatus status))
                status = ServiceStatus.Draft;

            if (!Enum.TryParse(vm.Availability, true, out ServiceAvailability availability))
                availability = ServiceAvailability.Available;

            MedicalService service = new MedicalService(
                request.NewId,
                vm.Code,
                vm.Name,
                vm.ShortName,
                vm.Description,
                status,
                availability,
                vm.BasePrice,
                vm.Currency,
                vm.VatIncluded,
                vm.DurationMinutes,
                vm.RequiresAppointment,
                vm.RequiresReferral,
                vm.PrimaryDoctorId,
                vm.HospitalId,
                vm.CategoryId,
                MedicalServiceViewModel.SerializeTags(vm.Tags)
            );

            service.SetTenantId(_user.GetTenantId());
            service.SetCreatedBy(_user.GetUserId());
            service.ReplaceDepartments(vm.DepartmentIds ?? new List<Guid>());
            service.ReplaceDoctors(vm.DoctorIds ?? new List<Guid>());

            SharedKernel.Results.DbResult<Guid> result = await _medicalServiceRepository.InsertAsync<MedicalService, Guid>(service);

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));
            }
        }
    }
}