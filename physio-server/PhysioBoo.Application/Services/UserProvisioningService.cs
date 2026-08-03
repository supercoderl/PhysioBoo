using PhysioBoo.Application.Interfaces;
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Services
{
    public class UserProvisioningService : IUserProvisioningService
    {
        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;

        public UserProvisioningService(
            IUserRepository userRepository,
            IRoleRepository roleRepository
        )
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
        }

        /// <summary>
        /// Creates a new user with the specified role and optional profile.
        /// </summary>
        /// <param name="id">The unique identifier of the user.</param>
        /// <param name="user">The user registration information.</param>
        /// <param name="profile">Optional profile information to associate with the user.</param>
        /// <param name="role">The role assigned to the user.</param>
        /// <param name="assignedBy">The identifier of the user assigning the role, if applicable.</param>
        /// <returns>The newly created <see cref="User"/> entity.</returns>
        public async Task<User> BuildAsync(Guid id, CreateUserViewModel user, Profile? profile = null, Guid? assignedBy = null)
        {
            User newUser = new User(id, user.Email, user.Phone, AuthHelper.HashPassword(user.Password));
            newUser.SetProfile(profile);

            Guid? roleId = await _roleRepository.GetIdByEnumAsync(user.Role);
            if (roleId.HasValue)
            {
                UserRole userRole = new UserRole(Guid.NewGuid(), newUser.Id, roleId.Value, assignedBy);
                newUser.SetUserRole(userRole);
            }

            return newUser;
        }
    }
}
