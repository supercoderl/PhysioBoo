using MediatR;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Bills.CreateBill
{
    public sealed class CreateBillCommandHandler : CommandHandlerBase, IRequestHandler<CreateBillCommand>
    {
        private readonly IBillRepository _billRepository;
        private readonly IUser _user;
        private readonly ISys_SequenceTrackerRepository _sys_SequenceTrackerRepository;

        public CreateBillCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IBillRepository billRepository,
            IUser user,
            ISys_SequenceTrackerRepository sys_SequenceTrackerRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _billRepository = billRepository;
            _user = user;
            _sys_SequenceTrackerRepository = sys_SequenceTrackerRepository;
        }

        public async Task Handle(CreateBillCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            string newCode = await _sys_SequenceTrackerRepository.GenerateNextCodeAsync(nameof(Bill), cancellationToken);

            Bill newBill = new Bill(
                request.NewBill.Id,
                newCode,
                request.NewBill.PatientId,
                request.NewBill.AppointmentId,
                request.NewBill.HospitalId,
                request.NewBill.DepartmentId,
                request.NewBill.Type,
                request.NewBill.DueDate,
                request.NewBill.PaymentTerms,
                request.NewBill.InsuranceCompanyId,
                request.NewBill.InsuranceClaimNumber,
                request.NewBill.Notes,
                request.NewBill.TermsAndConditions
            );

            newBill.SetTenantId(_user.GetTenantId());
            newBill.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _billRepository.InsertAsync<Bill, Guid>(newBill);

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
