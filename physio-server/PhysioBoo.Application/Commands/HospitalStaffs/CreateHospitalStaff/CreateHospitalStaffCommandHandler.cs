using MediatR;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.HospitalStaffs.CreateHospitalStaff
{
    public sealed class CreateHospitalStaffCommandHandler : CommandHandlerBase, IRequestHandler<CreateHospitalStaffCommand>
    {
        private readonly IHospitalStaffRepository _hospitalStaffRepository;
        private readonly IUser _user;

        public CreateHospitalStaffCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IHospitalStaffRepository hospitalStaffRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _hospitalStaffRepository = hospitalStaffRepository;
            _user = user;
        }

        public async Task Handle(CreateHospitalStaffCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            HospitalStaff newHospitalStaff = new HospitalStaff(
                request.NewHospitalStaff.Id,
                request.NewHospitalStaff.EmployeeId,
                request.NewHospitalStaff.HospitalId,
                request.NewHospitalStaff.DepartmentId,
                request.NewHospitalStaff.StaffType,
                request.NewHospitalStaff.Position,
                request.NewHospitalStaff.EmploymentType,
                request.NewHospitalStaff.Salary,
                request.NewHospitalStaff.HourlyRate,
                request.NewHospitalStaff.ProbationEndDate,
                request.NewHospitalStaff.TerminationDate,
                request.NewHospitalStaff.ShiftPattern,
                request.NewHospitalStaff.ReportingManger,
                request.NewHospitalStaff.EmergencyContactName,
                request.NewHospitalStaff.EmergencyContactPhone,
                request.NewHospitalStaff.BloodGroup,
                request.NewHospitalStaff.MedicalFitnessExpiry,
                request.NewHospitalStaff.BankAccountDetails,
                request.NewHospitalStaff.PanNumber,
                request.NewHospitalStaff.EsiNumber,
                request.NewHospitalStaff.PfNumber
            );

            newHospitalStaff.SetTenantId(_user.GetTenantId());
            newHospitalStaff.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _hospitalStaffRepository.InsertAsync<HospitalStaff, Guid>(newHospitalStaff);

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));

                return;
            }
        }
    }
}