using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.PrescriptionTemplates.RemoveFavoriteMedication
{
    public sealed class RemoveFavoriteMedicationCommandHandler : CommandHandlerBase, IRequestHandler<RemoveFavoriteMedicationCommand>
    {
        private readonly IFavoriteMedicationRepository _favoriteRepository;

        public RemoveFavoriteMedicationCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IFavoriteMedicationRepository favoriteRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _favoriteRepository = favoriteRepository;
        }

        public async Task Handle(RemoveFavoriteMedicationCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            FavoriteMedication? favorite = await _favoriteRepository
                .GetAll(f => f.Id == request.FavoriteId && f.DoctorId == request.DoctorId)
                .FirstOrDefaultAsync(ct);

            if (favorite == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Favorite {request.FavoriteId} doesn't exist for this doctor.", ErrorCodes.ObjectNotFound));
                return;
            }

            // Hard delete: (DoctorId, MedicineId) is unique, so a soft-deleted row would block re-adding it.
            _favoriteRepository.SoftDeleteSingle(favorite, hardDelete: true, ct);

            await CommitAsync();
        }
    }
}
