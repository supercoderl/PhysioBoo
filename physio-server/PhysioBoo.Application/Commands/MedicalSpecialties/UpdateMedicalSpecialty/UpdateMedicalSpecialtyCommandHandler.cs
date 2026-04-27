using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Shared.Events.MedicalSpecialties;

namespace PhysioBoo.Application.Commands.MedicalSpecialties.UpdateMedicalSpecialty
{
    public sealed class UpdateMedicalSpecialtyCommandHandler : CommandHandlerBase, IRequestHandler<UpdateMedicalSpecialtyCommand>
    {
        private readonly IMedicalSpecialtyRepository _medicalSpecialtyRepository;

        public UpdateMedicalSpecialtyCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IMedicalSpecialtyRepository medicalSpecialtyRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _medicalSpecialtyRepository = medicalSpecialtyRepository;
        }

        public async Task Handle(UpdateMedicalSpecialtyCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.MedicalStaff.MedicalSpecialty? medicalSpecialty = await _medicalSpecialtyRepository.GetByIdAsync(request.Id);

            if (medicalSpecialty == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Medical Specialty with Id {request.Id} not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            string oldIconUrl = medicalSpecialty.IconUrl ?? string.Empty;

            medicalSpecialty.SetName(request.MedicalSpecialty.Name);
            medicalSpecialty.SetCode(request.MedicalSpecialty.Code);
            medicalSpecialty.SetCategory(request.MedicalSpecialty.Category);
            medicalSpecialty.SetDescription(request.MedicalSpecialty.Description);
            medicalSpecialty.SetRequiredQualifications(request.MedicalSpecialty.RequiredQualifications);
            medicalSpecialty.SetParentSpecialtyId(request.MedicalSpecialty.ParentSpecialtyId);
            medicalSpecialty.SetIconUrl(request.MedicalSpecialty.IconUrl);
            medicalSpecialty.SetIsSurgical(request.MedicalSpecialty.IsSurgical);
            medicalSpecialty.SetIsDiagnostic(request.MedicalSpecialty.IsDiagnostic);
            medicalSpecialty.SetAverageConsultationDuration(request.MedicalSpecialty.AverageConsultationDuration);

            int resultCount = await _medicalSpecialtyRepository.UpdateTrackedAsync(medicalSpecialty, cancellationToken);

            if (resultCount > 0)
            {
                await Bus.RaiseEventAsync(new MedicalSpecialtyUpdatedEvent(request.Id, request.MedicalSpecialty.IconPublicId, request.MedicalSpecialty.IconUrl, oldIconUrl));
            }
        }
    }
}
