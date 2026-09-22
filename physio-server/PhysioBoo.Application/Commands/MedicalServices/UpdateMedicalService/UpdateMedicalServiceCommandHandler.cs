using PhysioBoo.Application.ViewModels.MedicalServices;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.MedicalServices.UpdateMedicalService
{
    public sealed class UpdateMedicalServiceCommandHandler : CommandHandlerBase, IRequestHandler<UpdateMedicalServiceCommand>
    {
        private readonly IMedicalServiceRepository _medicalServiceRepository;
        private readonly IUser _user;

        public UpdateMedicalServiceCommandHandler(
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

        public async Task Handle(UpdateMedicalServiceCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Operation.MedicalService? medicalService = await _medicalServiceRepository.GetWithLinksAsync(request.Id, cancellationToken);

            if (medicalService == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Medical service with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            ViewModels.MedicalServices.UpdateMedicalServiceViewModel vm = request.MedicalService;

            if (vm.Code != null && vm.Code != medicalService.Code)
            {
                if (await _medicalServiceRepository.CodeExistsAsync(vm.Code, medicalService.Id, cancellationToken))
                {
                    await NotifyAsync(new DomainNotification(
                        request.MessageType, $"A service with code '{vm.Code}' already exists.",
                        DomainErrorCodes.MedicalService.CodeAlreadyExists));
                    return;
                }
                medicalService.SetCode(vm.Code);
            }

            if (!string.IsNullOrEmpty(request.MedicalService.Name))
                medicalService.SetName(request.MedicalService.Name);

            if (!string.IsNullOrEmpty(request.MedicalService.ShortName))
                medicalService.SetShortName(request.MedicalService.ShortName);

            if (!string.IsNullOrEmpty(request.MedicalService.Description))
                medicalService.SetDescription(request.MedicalService.Description);

            if (request.MedicalService.DepartmentIds != null)
                medicalService.ReplaceDepartments(request.MedicalService.DepartmentIds);

            if (request.MedicalService.CategoryId.HasValue)
                medicalService.SetCategoryId(request.MedicalService.CategoryId.Value);

            if (request.MedicalService.Tags != null)
                medicalService.SetTags(MedicalServiceViewModel.SerializeTags(request.MedicalService.Tags));

            if (!string.IsNullOrEmpty(request.MedicalService.Status) &&
                Enum.TryParse(request.MedicalService.Status, true, out ServiceStatus status))
                medicalService.SetStatus(status);

            if (!string.IsNullOrEmpty(request.MedicalService.Availability) &&
                Enum.TryParse(request.MedicalService.Availability, true, out ServiceAvailability availability))
                medicalService.SetAvailability(availability);

            if (request.MedicalService.BasePrice.HasValue)
                medicalService.SetBasePrice(request.MedicalService.BasePrice.Value);

            if (!string.IsNullOrEmpty(request.MedicalService.Currency))
                medicalService.SetCurrency(request.MedicalService.Currency);

            if (request.MedicalService.VatIncluded.HasValue)
                medicalService.SetVatIncluded(request.MedicalService.VatIncluded.Value);

            if (request.MedicalService.DurationMinutes.HasValue)
                medicalService.SetDurationMinutes(request.MedicalService.DurationMinutes.Value);

            if (request.MedicalService.RequiresAppointment.HasValue)
                medicalService.SetRequiresAppointment(request.MedicalService.RequiresAppointment.Value);

            if (request.MedicalService.RequiresReferral.HasValue)
                medicalService.SetRequiresReferral(request.MedicalService.RequiresReferral.Value);

            if (request.MedicalService.PrimaryDoctorId.HasValue)
                medicalService.SetPrimaryDoctorId(request.MedicalService.PrimaryDoctorId.Value);

            if (request.MedicalService.DoctorIds != null)
                medicalService.ReplaceDoctors(request.MedicalService.DoctorIds);

            if (request.MedicalService.HospitalId.HasValue)
                medicalService.SetHospitalId(request.MedicalService.HospitalId.Value);

            medicalService.SetUpdatedBy(_user.GetUserId());

            await _medicalServiceRepository.UpdateTrackedAsync(medicalService, cancellationToken);
        }
    }
}