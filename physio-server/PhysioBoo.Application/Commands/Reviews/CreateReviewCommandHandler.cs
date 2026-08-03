using MediatR;
using PhysioBoo.Domain.Entities.Support;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Reviews
{
    public sealed class CreateReviewCommandHandler : CommandHandlerBase, IRequestHandler<CreateReviewCommand>
    {
        private readonly IReviewRepository _reviewRepository;
        private readonly IUser _user;

        public CreateReviewCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IReviewRepository reviewRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _reviewRepository = reviewRepository;
            _user = user;
        }

        public async Task Handle(CreateReviewCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Review newReview = new Review(
                request.NewReview.Id,
                _user.GetUserId(),
                request.NewReview.ReviewType,
                request.NewReview.EntityId,
                request.NewReview.AppointmentId,
                request.NewReview.OverallRating,
                request.NewReview.DoctorPunctuality,
                request.NewReview.DoctorBehavior,
                request.NewReview.TreatmentSatisfaction,
                request.NewReview.FacilityCleanliness,
                request.NewReview.StaffBehavior,
                request.NewReview.ValueForMoney,
                request.NewReview.Title,
                request.NewReview.Comment,
                request.NewReview.Pros,
                request.NewReview.Cons,
                request.NewReview.WouldRecommend,
                request.NewReview.VisitedFor,
                request.NewReview.WaitTimeMinutes,
                request.NewReview.ModerationNotes,
                request.NewReview.ModeratedBy,
                request.NewReview.ModeratedAt,
                null,
                null,
                null
            );

            newReview.SetTenantId(_user.GetTenantId());
            newReview.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _reviewRepository.InsertAsync<Review, Guid>(newReview);

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
