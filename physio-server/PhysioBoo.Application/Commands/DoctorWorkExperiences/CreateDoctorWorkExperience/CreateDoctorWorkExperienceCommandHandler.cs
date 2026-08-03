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
        private readonly IUser _user;

        public CreateDoctorWorkExperienceCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IDoctorWorkExperienceRepository doctorWorkExperienceRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _doctorWorkExperienceRepository = doctorWorkExperienceRepository;
            _user = user;
        }

        public async Task Handle(CreateDoctorWorkExperienceCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            DoctorWorkExperience newDoctorWorkExperience = new DoctorWorkExperience(
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
            );

            newDoctorWorkExperience.SetTenantId(_user.GetTenantId());
            newDoctorWorkExperience.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _doctorWorkExperienceRepository.InsertAsync<DoctorWorkExperience, Guid>(newDoctorWorkExperience);

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