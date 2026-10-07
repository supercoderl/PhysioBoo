using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Users.UpdateMyAccount
{
    public sealed class UpdateMyAccountCommandHandler : CommandHandlerBase, IRequestHandler<UpdateMyAccountCommand>
    {
        private readonly IUserRepository _userRepository;
        private readonly IUser _user;

        public UpdateMyAccountCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IUserRepository userRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _userRepository = userRepository;
            _user = user;
        }

        public async Task Handle(UpdateMyAccountCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Guid userId = _user.GetUserId();
            User? user = await _userRepository.GetAll(u => u.Id == userId, includeProperties: "Profile").AsTracking().FirstOrDefaultAsync(ct);

            if (user == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, "User doesn't exist.", ErrorCodes.ObjectNotFound));
                return;
            }

            UpdateMyAccountViewModel vm = request.Account;

            if (vm.Phone != null) user.SetPhone(vm.Phone.Trim());
            if (vm.AlternatePhone != null) user.SetAlternatePhone(Clean(vm.AlternatePhone));
            user.SetUpdatedBy(userId);

            Profile? profile = user.Profile;
            if (profile == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "This account has no profile yet; ask an administrator to complete it.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            if (vm.FirstName != null) profile.SetFirstName(vm.FirstName.Trim());
            if (vm.MiddleName != null) profile.SetMiddleName(vm.MiddleName.Trim());
            if (vm.LastName != null) profile.SetLastName(vm.LastName.Trim());
            if (vm.DateOfBirth.HasValue) profile.SetDateOfBirth(vm.DateOfBirth.Value);
            if (Enum.TryParse(vm.Gender, true, out Gender gender)) profile.SetGender(gender);
            if (Enum.TryParse(vm.MaritalStatus, true, out MaritalStatus marital)) profile.SetMaritalStatus(marital);
            if (Enum.TryParse(vm.BloodGroup, true, out BloodGroup blood)) profile.SetBloodGroup(blood);
            if (Enum.TryParse(vm.PreferredCommunication, true, out PreferredCommunication communication)) profile.SetPreferredCommunication(communication);
            if (vm.Nationality != null) profile.SetNationality(Clean(vm.Nationality));
            if (vm.Phone != null) profile.SetPhone(vm.Phone.Trim());
            if (vm.IdentificationType != null) profile.SetIdentificationType(Clean(vm.IdentificationType));
            if (vm.IdentificationNumber != null) profile.SetIdentificationNumber(Clean(vm.IdentificationNumber));
            if (vm.IdentificationExpiry.HasValue) profile.SetIdentificationExpiry(vm.IdentificationExpiry);
            if (vm.EmergencyContactName != null) profile.SetEmergencyContactName(Clean(vm.EmergencyContactName));
            if (vm.EmergencyContactPhone != null) profile.SetEmergencyContactPhone(Clean(vm.EmergencyContactPhone));
            if (vm.EmergencyContactRelationship != null) profile.SetEmergencyContactRelationship(Clean(vm.EmergencyContactRelationship));
            profile.SetUpdatedBy(userId);

            await CommitAsync();
        }

        private static string? Clean(string value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
