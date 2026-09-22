using PhysioBoo.Application.Interfaces;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Shared.Events.HospitalGroups;
using PhysioBoo.Shared.Events.Hospitals;
using PhysioBoo.Shared.Events.Users;

namespace PhysioBoo.Application.Commands.Tenants.RegisterTenant
{
    public sealed class RegisterTenantCommandHandler : CommandHandlerBase, IRequestHandler<RegisterTenantCommand>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHospitalGroupRepository _hospitalGroupRepository;
        private readonly IHospitalRepository _hospitalRepository;
        private readonly IUserRepository _userRepository;
        private readonly IUserProvisioningService _userProvisioningService;
        private readonly ISys_SequenceTrackerRepository _sys_SequenceTrackerRepository;

        public RegisterTenantCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IHospitalGroupRepository hospitalGroupRepository,
            IHospitalRepository hospitalRepository,
            IUserRepository userRepository,
            IUserProvisioningService userProvisioningService,
            ISys_SequenceTrackerRepository sys_SequenceTrackerRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _unitOfWork = unitOfWork;
            _hospitalGroupRepository = hospitalGroupRepository;
            _hospitalRepository = hospitalRepository;
            _userRepository = userRepository;
            _userProvisioningService = userProvisioningService;
            _sys_SequenceTrackerRepository = sys_SequenceTrackerRepository;
        }

        public async Task Handle(RegisterTenantCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            await _unitOfWork.BeginTransactionAsync(cancellationToken);

            HospitalGroup newHospitalGroup = new HospitalGroup(
                request.NewId,
                request.NewTenant.Company.Name,
                request.NewTenant.Company.Description,
                request.NewTenant.Company.HeadquartersAddress,
                request.NewTenant.Company.Website,
                request.NewTenant.Company.Phone,
                request.NewTenant.Company.Email,
                request.NewTenant.Company.LogoUrl,
                request.NewTenant.Company.EstablishedDate,
                request.NewTenant.Company.LicenseNumber,
                request.NewTenant.Company.AccreditationDetails
            );

            SharedKernel.Results.DbResult<Guid> result = await _hospitalGroupRepository.InsertAsync<HospitalGroup, Guid>(newHospitalGroup);

            if (!result.Success)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));

                return;
            }

            (bool BranchesSuccess, List<Guid> HospitalIds) branchOutcome = await RegisterBranch(request, cancellationToken);
            if (!branchOutcome.BranchesSuccess) return;

            (bool OwnerSuccess, Guid? UserId) ownerOutcome = await RegisterOwner(request, cancellationToken);
            if (!ownerOutcome.OwnerSuccess) return;

            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            await Bus.RaiseEventAsync(new HospitalGroupCreatedEvent(result.Id));
            foreach (Guid hospitalId in branchOutcome.HospitalIds)
            {
                await Bus.RaiseEventAsync(new HospitalCreatedEvent(hospitalId));
            }

            await Bus.RaiseEventAsync(new UsersCreatedEvent(
                ownerOutcome.UserId!.Value,
                VerificationType.Email.ToString()
            ));
        }

        private async Task<(bool Success, List<Guid> HospitalIds)> RegisterBranch(RegisterTenantCommand request, CancellationToken ct)
        {
            List<Guid> hospitalIds = new List<Guid>();

            foreach (ViewModels.Tenants.RegisterTenantBranchViewModel branch in request.NewTenant.Branches)
            {
                string code = await _sys_SequenceTrackerRepository.GenerateNextCodeAsync(nameof(Hospital), ct);

                Hospital newHospital = new Hospital(
                    Guid.NewGuid(),
                    branch.Name,
                    code,
                    branch.HospitalType,
                    branch.EmergencyCapacity,
                    branch.OperationTheaters,
                    branch.Address,
                    branch.City,
                    branch.StateProvince,
                    branch.PostalCode,
                    branch.Country,
                    branch.Phone,
                    branch.Fax,
                    branch.Email,
                    branch.Website,
                    branch.EmergencyPhone,
                    branch.AmbulancePhone,
                    branch.Latitude,
                    branch.Longtitude,
                    branch.EstablishedDate,
                    branch.LicenseNumber,
                    branch.LicenseExpiry,
                    branch.AccreditationBody,
                    branch.AccreditationExpiry,
                    branch.InsuranceAccepted,
                    branch.LanguagesSupported,
                    branch.Facilities,
                    branch.OperatingHours,
                    branch.LogoUrl,
                    branch.Images,
                    branch.Description,
                    branch.MissionStatement,
                    branch.VisionStatement
                );

                newHospital.SetTenantId(request.NewId);

                SharedKernel.Results.DbResult<Guid> result = await _hospitalRepository.InsertAsync<Hospital, Guid>(newHospital);

                if (!result.Success)
                {
                    await _unitOfWork.RollbackTransactionAsync(ct);
                    await NotifyAsync(new DomainNotification(
                        request.MessageType,
                        $"Insert failed, please try again. Error: {result.Error}",
                        ErrorCodes.CommitFailed
                    ));

                    return (false, hospitalIds);
                }

                hospitalIds.Add(result.Id);
            }

            return (true, hospitalIds);
        }

        private async Task<(bool Success, Guid? OnwerId)> RegisterOwner(RegisterTenantCommand request, CancellationToken ct)
        {
            User newUser = await _userProvisioningService.BuildAsync(
                Guid.NewGuid(),
                new ViewModels.Users.CreateUserViewModel(
                    request.NewTenant.Owner.Email,
                    request.NewTenant.Owner.Phone,
                    request.NewTenant.Owner.Password,
                    Domain.Enums.Role.ADMIN
                ),
                null,
                null
            );

            newUser.SetTenantId(request.NewId);

            SharedKernel.Results.DbResult<Guid> result = await _userRepository.InsertAsync<User, Guid>(newUser);

            if (!result.Success)
            {
                await _unitOfWork.RollbackTransactionAsync(ct);
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));

                return (false, null);
            }

            return (true, result.Id);
        }
    }
}