using PhysioBoo.Application.ViewModels.HomeContent;
using PhysioBoo.Domain.Entities.Cms;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.HomeTestimonials.UpdateHomeTestimonial
{
    public sealed class UpdateHomeTestimonialCommandHandler : CommandHandlerBase, IRequestHandler<UpdateHomeTestimonialCommand>
    {
        private readonly IHomeTestimonialRepository _repository;
        private readonly IUser _user;

        public UpdateHomeTestimonialCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IHomeTestimonialRepository repository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _repository = repository;
            _user = user;
        }

        public async Task Handle(UpdateHomeTestimonialCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            HomeTestimonial? entity = await _repository.GetByIdAsync(request.Id, ct: cancellationToken);

            if (entity == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Home testimonial with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            SaveHomeTestimonialViewModel vm = request.HomeTestimonial;

            if (vm.PatientName != null)
                entity.SetPatientName(vm.PatientName.Trim());
            if (vm.Rating.HasValue)
                entity.SetRating(vm.Rating.Value);
            if (vm.Comment != null)
                entity.SetComment(string.IsNullOrWhiteSpace(vm.Comment) ? null : vm.Comment.Trim());
            entity.SetDate(vm.Date);
            if (vm.Active.HasValue)
                entity.SetActive(vm.Active.Value);

            entity.SetUpdatedBy(_user.GetUserId());

            await _repository.UpdateTrackedAsync(entity, cancellationToken);
        }
    }
}
