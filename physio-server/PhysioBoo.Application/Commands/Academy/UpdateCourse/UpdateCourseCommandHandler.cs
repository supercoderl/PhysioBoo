using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Academy.UpdateCourse
{
    public sealed class UpdateCourseCommandHandler : CommandHandlerBase, IRequestHandler<UpdateCourseCommand>
    {
        private readonly ICourseRepository _courseRepository;
        private readonly IUser _user;

        public UpdateCourseCommandHandler(
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

        public async Task Handle(UpdateCourseCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            string title = request.Input.Title.Trim();
            string category = request.Input.Category.Trim();
            string? description = string.IsNullOrWhiteSpace(request.Input.Description) ? null : request.Input.Description.Trim();
            bool isPublished = request.Input.IsPublished;
            Guid? userId = _user.GetUserId();
            DateTime? updatedAt = TimeZoneHelper.GetLocalTimeNow();

            int updated = await _courseRepository.BatchUpdateMultipleAsync(
                c => c.Id == request.Id,
                s => s
                    .SetProperty(c => c.Title, title)
                    .SetProperty(c => c.Description, description)
                    .SetProperty(c => c.Category, category)
                    .SetProperty(c => c.IsPublished, isPublished)
                    .SetProperty(c => c.UpdatedBy, userId)
                    .SetProperty(c => c.UpdatedAt, updatedAt),
                cancellationToken
            );

            if (updated == 0)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Course with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
            }
        }
    }
}
