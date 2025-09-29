using MediatR;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.DoctorPublications.CreateDoctorPublication
{
    public sealed class CreateDoctorPublicationCommandHandler : CommandHandlerBase, IRequestHandler<CreateDoctorPublicationCommand>
    {
        private readonly IDoctorPublicationRepository _doctorPublicationRepository;

        // TODO: Add your dependencies via constructor
        public CreateDoctorPublicationCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IDoctorPublicationRepository doctorPublicationRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _doctorPublicationRepository = doctorPublicationRepository;
        }

        public async Task Handle(CreateDoctorPublicationCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            SharedKernel.Results.DbResult<Guid> result = await _doctorPublicationRepository.InsertAsync<DoctorPublication, Guid>(new DoctorPublication(
                request.NewDoctorPublication.Id,
                request.NewDoctorPublication.DoctorId,
                request.NewDoctorPublication.Title,
                request.NewDoctorPublication.PublicationType,
                request.NewDoctorPublication.JournalName,
                request.NewDoctorPublication.ConferenceName,
                request.NewDoctorPublication.Publisher,
                request.NewDoctorPublication.PublicationDate,
                request.NewDoctorPublication.Volume,
                request.NewDoctorPublication.Issue,
                request.NewDoctorPublication.Pages,
                request.NewDoctorPublication.Doi,
                request.NewDoctorPublication.Pmid,
                request.NewDoctorPublication.Isbm,
                request.NewDoctorPublication.ImpactFactor,
                request.NewDoctorPublication.CoAuthors,
                request.NewDoctorPublication.Abstract,
                request.NewDoctorPublication.Keywords,
                request.NewDoctorPublication.IsPeerReviewed,
                request.NewDoctorPublication.PublicationUrl,
                request.NewDoctorPublication.PdfUrl
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
        }
    }
}