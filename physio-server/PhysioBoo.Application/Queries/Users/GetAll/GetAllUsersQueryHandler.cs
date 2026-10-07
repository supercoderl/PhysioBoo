
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;
using System.Linq.Expressions;

namespace PhysioBoo.Application.Queries.Users.GetAll
{
    public sealed class GetAllUsersQueryHandler : IRequestHandler<GetAllUsersQuery, PagedResult<UserViewModel>>
    {
        private readonly IUserRepository _userRepository;

        public GetAllUsersQueryHandler(
            IUserRepository userRepository
        )
        {
            _userRepository = userRepository;
        }

        public async Task<PagedResult<UserViewModel>> Handle(GetAllUsersQuery q, CancellationToken ct)
        {
            PagedRequest<UserFilter> req = q.Request;
            Expression<Func<User, bool>>? predicate = null;

            bool? isActive = req.Filter?.IsActive;
            string term = req.Search?.Trim().ToLower() ?? string.Empty;

            predicate = u =>
                (!isActive.HasValue || u.IsActive == isActive.Value) &&
                (term == string.Empty || u.Email.ToLower().Contains(term));

            // Sort keys arrive as "email", "+email" or "-email" (minus = descending).
            Func<IQueryable<User>, IOrderedQueryable<User>>? orderBy = null;
            if (!string.IsNullOrEmpty(req.Sort))
            {
                bool descending = req.Sort.StartsWith('-');
                string key = req.Sort.TrimStart('+', '-');

                if (key.Equals("email", StringComparison.OrdinalIgnoreCase))
                    orderBy = descending ? q => q.OrderByDescending(u => u.Email) : q => q.OrderBy(u => u.Email);
                else if (key.Equals("createdAt", StringComparison.OrdinalIgnoreCase))
                    orderBy = descending || req.Sort == key ? q => q.OrderByDescending(u => u.CreatedAt) : q => q.OrderBy(u => u.CreatedAt);
            }

            PagedResult<User> paged = await _userRepository.GetPagedAsync(
                pageNumber: req.PageNumber,
                pageSize: req.PageSize,
                filter: predicate,
                orderBy: orderBy,
                includeProperties: "Profile,UserRoles.Role",
                ct: ct
            );

            // Map to view model
            List<UserViewModel> items = paged.Items.Select(u => UserViewModel.FromUser(u)).ToList();
            return new PagedResult<UserViewModel>(paged.TotalCount, items, req.PageNumber, req.PageSize);
        }
    }
}
