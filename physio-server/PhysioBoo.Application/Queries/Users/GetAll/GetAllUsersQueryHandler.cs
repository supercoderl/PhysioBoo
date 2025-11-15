using MediatR;
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

        public async Task<PagedResult<UserViewModel>> Handle(GetAllUsersQuery q, CancellationToken cancellationToken)
        {
            PagedRequest<UserFilter> req = q.Request;
            Expression<Func<User, bool>>? predicate = null;

            if (req.Filter != null)
            {
                predicate = u =>
                    (!req.Filter.IsActive.HasValue || u.IsActive == req.Filter.IsActive.Value);
            }

            Func<IQueryable<User>, IOrderedQueryable<User>>? orderBy = null;
            if (!string.IsNullOrEmpty(req.Sort))
            {
                if (req.Sort.Equals("email", StringComparison.OrdinalIgnoreCase))
                    orderBy = q => q.OrderBy(u => u.Email);
                else if (req.Sort.Equals("createdAt", StringComparison.OrdinalIgnoreCase))
                    orderBy = q => q.OrderByDescending(u => u.CreatedAt);
            }

            PagedResult<User> paged = await _userRepository.GetPagedAsync(
                pageNumber: req.PageNumber,
                pageSize: req.PageSize,
                filter: predicate,
                orderBy: orderBy,
                cancellationToken: cancellationToken
            );

            // Map to view model
            List<UserViewModel> items = paged.Items.Select(u => UserViewModel.FromUser(u)).ToList();
            return new PagedResult<UserViewModel>(paged.TotalCount, items, req.PageNumber, req.PageSize);
        }
    }
}
