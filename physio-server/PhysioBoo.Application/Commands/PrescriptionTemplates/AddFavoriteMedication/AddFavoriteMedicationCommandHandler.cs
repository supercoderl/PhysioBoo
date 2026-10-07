using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.PrescriptionTemplates.AddFavoriteMedication
{
    public sealed class AddFavoriteMedicationCommandHandler : CommandHandlerBase, IRequestHandler<AddFavoriteMedicationCommand>
    {
        private readonly IFavoriteMedicationRepository _favoriteRepository;
        private readonly IDoctorRepository _doctorRepository;
        private readonly IMedicineRepository _medicineRepository;
        private readonly IUser _user;

        public AddFavoriteMedicationCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IFavoriteMedicationRepository favoriteRepository,
            IDoctorRepository doctorRepository,
            IMedicineRepository medicineRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _favoriteRepository = favoriteRepository;
            _doctorRepository = doctorRepository;
            _medicineRepository = medicineRepository;
            _user = user;
        }

        public async Task Handle(AddFavoriteMedicationCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            if (!await _doctorRepository.ExistsAsync(request.DoctorId, ct))
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Doctor with id {request.DoctorId} doesn't exist.", ErrorCodes.ObjectNotFound));
                return;
            }

            if (!await _medicineRepository.ExistsAsync(m => m.Id == request.Favorite.MedicineId && m.IsActive, ct))
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Medicine with id {request.Favorite.MedicineId} doesn't exist or is inactive.", ErrorCodes.ObjectNotFound));
                return;
            }

            string? dose = string.IsNullOrWhiteSpace(request.Favorite.Dose) ? null : request.Favorite.Dose.Trim();
            string? frequency = string.IsNullOrWhiteSpace(request.Favorite.Frequency) ? null : request.Favorite.Frequency.Trim();

            FavoriteMedication? favorite = await _favoriteRepository
                .GetAll(f => f.DoctorId == request.DoctorId && f.MedicineId == request.Favorite.MedicineId).AsTracking()
                .FirstOrDefaultAsync(ct);

            if (favorite == null)
            {
                favorite = new FavoriteMedication(request.NewId, request.DoctorId, request.Favorite.MedicineId, dose, frequency, request.Favorite.DurationDays);
                favorite.SetTenantId(_user.GetTenantId());
                favorite.SetCreatedBy(_user.GetUserId());
                _favoriteRepository.Add(favorite);
            }
            else
            {
                favorite.SetDefaultDose(dose);
                favorite.SetDefaultFrequency(frequency);
                favorite.SetDefaultDurationInDays(request.Favorite.DurationDays);
                favorite.SetUpdatedBy(_user.GetUserId());
            }

            if (await CommitAsync())
            {
                request.FavoriteId = favorite.Id;
            }
        }
    }
}
