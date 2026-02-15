using MediatR;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Shared.Events.MedicalSpecialties;

namespace PhysioBoo.Application.Commands.MedicalSpecialties.CreateMedicalSpecialty
{
    public sealed class CreateMedicalSpecialtyCommandHandler : CommandHandlerBase, IRequestHandler<CreateMedicalSpecialtyCommand>
    {
        private readonly IMedicalSpecialtyRepository _medicalSpecialtyRepository;

        public CreateMedicalSpecialtyCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IMedicalSpecialtyRepository medicalSpecialtyRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _medicalSpecialtyRepository = medicalSpecialtyRepository;
        }

        public async Task Handle(CreateMedicalSpecialtyCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            MedicalSpecialty medicalSpecialty = new MedicalSpecialty(
                request.NewMedicalSpecialty.Id,
                request.NewMedicalSpecialty.Name,
                request.NewMedicalSpecialty.Code,
                request.NewMedicalSpecialty.Category,
                request.NewMedicalSpecialty.Description,
                request.NewMedicalSpecialty.RequiredQualifications,
                request.NewMedicalSpecialty.ParentSpecialtyId,
                request.NewMedicalSpecialty.IconUrl
            );

            medicalSpecialty.SetIsSurgical(request.NewMedicalSpecialty.IsSurgical);
            medicalSpecialty.SetIsDiagnostic(request.NewMedicalSpecialty.IsDiagnostic);
            medicalSpecialty.SetAverageConsultationDuration(request.NewMedicalSpecialty.AverageConsultationDuration);

            SharedKernel.Results.DbResult<Guid> result = await _medicalSpecialtyRepository.InsertAsync<MedicalSpecialty, Guid>(medicalSpecialty);

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));

                return;
            }

            await Bus.RaiseEventAsync(new MedicalSpecialtyCreatedEvent(result.Id, request.NewMedicalSpecialty.IconPublicId, request.NewMedicalSpecialty.IconUrl));
        }
    }
}