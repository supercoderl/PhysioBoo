
using PhysioBoo.Application.ViewModels.Retail;

namespace PhysioBoo.Application.Queries.RetailCarts.GetSuggestions
{
    // mode: Favorites | RecentlySold | Recommended
    public sealed record GetSuggestionsQuery(string Mode) : IRequest<List<RetailMedicineCardViewModel>>;
}
