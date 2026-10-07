using PhysioBoo.Domain.Entities.Cms;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.HomeTestimonials.DeleteHomeTestimonial
{
    public sealed class DeleteHomeTestimonialCommandHandler : CommandHandlerBase, IRequestHandler<DeleteHomeTestimonialCommand>
    {
        private readonly IHomeTestimonialRepository _repository;

        public DeleteHomeTestimonialCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IHomeTestimonialRepository repository
        ) : base(bus, unitOfWork, notifications)
        {
            _repository = repository;
        }

        public async Task Handle(DeleteHomeTestimonialCommand request, CancellationToken cancellationToken)
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

            _repository.SoftDeleteSingle(entity, false, cancellationToken);

            await CommitAsync();
        }
    }
}
