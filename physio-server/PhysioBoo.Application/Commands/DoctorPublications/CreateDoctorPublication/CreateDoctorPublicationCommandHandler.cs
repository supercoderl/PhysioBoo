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
        private readonly IUser _user;

        // TODO: Add your dependencies via constructor
        public CreateDoctorPublicationCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IDoctorPublicationRepository doctorPublicationRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _doctorPublicationRepository = doctorPublicationRepository;
            _user = user;
        }

        public async Task Handle(CreateDoctorPublicationCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            DoctorPublication newDoctorPublication = new DoctorPublication(
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
            );

            newDoctorPublication.SetTenantId(_user.GetTenantId());
            newDoctorPublication.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _doctorPublicationRepository.InsertAsync<DoctorPublication, Guid>(newDoctorPublication);

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