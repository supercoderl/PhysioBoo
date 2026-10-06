using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.PrescriptionTemplates;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.PrescriptionTemplates.GetFavorites
{
    public sealed class GetFavoriteMedicationsQueryHandler : IRequestHandler<GetFavoriteMedicationsQuery, List<FavoriteMedicationViewModel>>
    {
        private readonly IFavoriteMedicationRepository _favoriteRepository;

        public GetFavoriteMedicationsQueryHandler(IFavoriteMedicationRepository favoriteRepository)
        {
            _favoriteRepository = favoriteRepository;
        }

        public async Task<List<FavoriteMedicationViewModel>> Handle(GetFavoriteMedicationsQuery request, CancellationToken ct)
        {
            List<FavoriteMedication> favorites = await _favoriteRepository
                .GetAllNoTracking(f => f.DoctorId == request.DoctorId && f.Medicine != null && f.Medicine.IsActive, includeProperties: "Medicine")
                .ToListAsync(ct);

            return favorites
                .Select(FavoriteMedicationViewModel.FromEntity)
                .OrderBy(f => f.Name)
                .ToList();
        }
    }
}
