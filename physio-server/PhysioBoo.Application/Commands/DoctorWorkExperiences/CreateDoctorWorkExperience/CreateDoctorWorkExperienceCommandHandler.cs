using MediatR;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.DoctorWorkExperiences.CreateDoctorWorkExperience
{
    public sealed class CreateDoctorWorkExperienceCommandHandler : CommandHandlerBase, IRequestHandler<CreateDoctorWorkExperienceCommand>
    {
        private readonly IDoctorWorkExperienceRepository _doctorWorkExperienceRepository;

        public CreateDoctorWorkExperienceCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IDoctorWorkExperienceRepository doctorWorkExperienceRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _doctorWorkExperienceRepository = doctorWorkExperienceRepository;
        }

        public async Task Handle(CreateDoctorWorkExperienceCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            SharedKernel.Results.DbResult<Guid> result = await _doctorWorkExperienceRepository.InsertAsync<DoctorWorkExperience, Guid>(new DoctorWorkExperience(
                request.NewDoctorWorkExperience.Id,
                request.NewDoctorWorkExperience.DoctorId,
                request.NewDoctorWorkExperience.PositionTitle,
                request.NewDoctorWorkExperience.EmploymentType,
                request.NewDoctorWorkExperience.OrganizationName,
                request.NewDoctorWorkExperience.OrganizationType,
                request.NewDoctorWorkExperience.Department,
                request.NewDoctorWorkExperience.Location,
                request.NewDoctorWorkExperience.Country,
                request.NewDoctorWorkExperience.StartDate,
                request.NewDoctorWorkExperience.EndDate,
                request.NewDoctorWorkExperience.Responsibilities,
                request.NewDoctorWorkExperience.Archievements,
                request.NewDoctorWorkExperience.SalaryRange,
                request.NewDoctorWorkExperience.ReasonForLeaving,
                request.NewDoctorWorkExperience.SupervisorName,
                request.NewDoctorWorkExperience.SupervisorContact
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