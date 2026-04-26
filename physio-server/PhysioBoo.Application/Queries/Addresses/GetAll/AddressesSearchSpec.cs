using Ardalis.Specification;
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Extensions;
using PhysioBoo.Application.ViewModels.Addresses;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Application.Queries.Addresses.GetAll
{
    public sealed class AddressesSearchSpec : Specification<Address>
    {
        public AddressesSearchSpec(
            GetAllAddressesQuery q,
            ISortingExpressionProvider<AddressViewModel, Address> sortingExpressionProvider
        )
        {
            // Apply filters
            if (!string.IsNullOrEmpty(q.Request.Search))
            {
                string[] terms = q.Request.Search.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);

                if (terms.Length > 0)
                {
                    string searchTerm = string.Join(" & ", terms.Select(t => $"{t}:*"));

                    Query.Where(x => x.SearchVector != null && x.SearchVector.Matches(
                        EF.Functions.ToTsQuery("english", EF.Functions.Unaccent(searchTerm))
                    ));
                }
            }

            // Apply filter
            if (q.Request.Filter != null)
            {
                if (!string.IsNullOrEmpty(q.Request.Filter.City))
                {
                    Query.Where(x => q.Request.Filter.City.Equals(x.City));
                }

                if (q.Request.Filter.UserId.HasValue)
                {
                    Query.Where(x => q.Request.Filter.UserId.Value == x.UserId);
                }
            }

            // Apply sorting
            SortQuery sortQuery = new SortQuery
            {
                Query = q.Request.Sort
            };
            Query.ApplySorting(sortQuery, sortingExpressionProvider);
        }
    }
}
