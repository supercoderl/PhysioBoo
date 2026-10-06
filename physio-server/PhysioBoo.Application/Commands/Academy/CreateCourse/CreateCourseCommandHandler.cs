using PhysioBoo.Application.ViewModels.Academy;
using PhysioBoo.Domain.Entities.Academy;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Academy.CreateCourse
{
    public sealed class CreateCourseCommandHandler : CommandHandlerBase, IRequestHandler<CreateCourseCommand>
    {
        private readonly ICourseRepository _courseRepository;
        private readonly IUser _user;

        public CreateCourseCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ICourseRepository courseRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _courseRepository = courseRepository;
            _user = user;
        }

        public async Task Handle(CreateCourseCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            SaveCourseViewModel vm = request.Input;
            string? description = string.IsNullOrWhiteSpace(vm.Description) ? null : vm.Description.Trim();

            Course course = new Course(request.NewId, vm.Title.Trim(), description, vm.Category.Trim(), vm.IsPublished);
            course.SetTenantId(_user.GetTenantId());
            course.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> inserted = await _courseRepository.InsertAsync<Course, Guid>(course);
            if (!inserted.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Failed to create course: {inserted.Error}",
                    ErrorCodes.CommitFailed
                ));
                return;
            }

            request.Result = CourseSummaryViewModel.FromEntity(course, 0, 0, 0);
        }
    }
}
