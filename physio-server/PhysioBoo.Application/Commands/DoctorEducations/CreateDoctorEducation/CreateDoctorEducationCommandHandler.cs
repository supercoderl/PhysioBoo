using MediatR;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.DoctorEducations.CreateDoctorEducation
{
    public sealed class CreateDoctorEducationCommandHandler : CommandHandlerBase, IRequestHandler<CreateDoctorEducationCommand>
    {
        private readonly IDoctorCertificationRepository _doctorCertificationRepository;
        private readonly IUser _user;

        public CreateDoctorEducationCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IDoctorCertificationRepository doctorCertificationRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _doctorCertificationRepository = doctorCertificationRepository;
            _user = user;
        }

        public async Task Handle(CreateDoctorEducationCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            DoctorEducation newDoctorEducation = new DoctorEducation(
                request.NewDoctorEducation.Id,
                request.NewDoctorEducation.DoctorId,
                request.NewDoctorEducation.DegreeType,
                request.NewDoctorEducation.DegreeName,
                request.NewDoctorEducation.Specialization,
                request.NewDoctorEducation.InstitutionName,
                request.NewDoctorEducation.UniversityName,
                request.NewDoctorEducation.Location,
                request.NewDoctorEducation.Country,
                request.NewDoctorEducation.StartDate,
                request.NewDoctorEducation.CompletionDate,
                request.NewDoctorEducation.DurationYears,
                request.NewDoctorEducation.GradePercentage,
                request.NewDoctorEducation.GradeGPA,
                request.NewDoctorEducation.GradeClass,
                request.NewDoctorEducation.ThesisTitle,
                request.NewDoctorEducation.ThesisGuide,
                request.NewDoctorEducation.VerificationDocumentUrl
            );

            newDoctorEducation.SetTenantId(_user.GetTenantId());
            newDoctorEducation.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _doctorCertificationRepository.InsertAsync<DoctorEducation, Guid>(newDoctorEducation);

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