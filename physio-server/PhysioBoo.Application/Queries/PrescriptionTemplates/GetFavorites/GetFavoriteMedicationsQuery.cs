using PhysioBoo.Application.ViewModels.PrescriptionTemplates;

namespace PhysioBoo.Application.Queries.PrescriptionTemplates.GetFavorites
{
    public sealed record GetFavoriteMedicationsQuery(Guid DoctorId) : IRequest<List<FavoriteMedicationViewModel>>;
}
