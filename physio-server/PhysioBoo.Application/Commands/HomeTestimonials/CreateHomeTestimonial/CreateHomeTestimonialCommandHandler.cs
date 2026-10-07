using PhysioBoo.Application.ViewModels.HomeContent;
using PhysioBoo.Domain.Entities.Cms;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.HomeTestimonials.CreateHomeTestimonial
{
    public sealed class CreateHomeTestimonialCommandHandler : CommandHandlerBase, IRequestHandler<CreateHomeTestimonialCommand>
    {
        private readonly IHomeTestimonialRepository _repository;
        private readonly IUser _user;

        public CreateHomeTestimonialCommandHandler(
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

        public async Task Handle(CreateHomeTestimonialCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            SaveHomeTestimonialViewModel vm = request.HomeTestimonial;

            HomeTestimonial entity = new HomeTestimonial(
                request.NewId,
                vm.PatientName!.Trim(),
                vm.Rating ?? 5,
                vm.Comment?.Trim(),
                vm.Date,
                vm.Active ?? true
            );

            entity.SetTenantId(_user.GetTenantId());
            entity.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _repository.InsertAsync<HomeTestimonial, Guid>(entity);

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));
            }
        }
    }
}
