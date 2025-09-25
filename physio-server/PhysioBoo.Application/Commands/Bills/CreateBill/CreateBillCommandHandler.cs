using MediatR;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Commands.Bills.CreateBill
{
    public sealed class CreateBillCommandHandler : CommandHandlerBase, IRequestHandler<CreateBillCommand>
    {
        private readonly IBillRepository _billRepository;

        public CreateBillCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IBillRepository billRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _billRepository = billRepository;
        }

        public async Task Handle(CreateBillCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var result = await _billRepository.InsertAsync<Bill, Guid>(new Bill(
                request.NewBill.Id,
                Generate(),
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
                request.NewBill.TermsAndConditions,
                request.UserId
            ));

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

        /// <summary>
        /// Generate appointment number based on current time.
        /// Format: APP-YYYYMMDD-HHMMSS-fff-RND
        /// Ví dụ: APP-20250923-182530-123-57
        /// </summary>
        public static string Generate()
        {
            var now = TimeZoneHelper.GetLocalTimeNow();

            return $"BILL-{now:yyyyMMdd-HHmmss}";
        }
    }
}
