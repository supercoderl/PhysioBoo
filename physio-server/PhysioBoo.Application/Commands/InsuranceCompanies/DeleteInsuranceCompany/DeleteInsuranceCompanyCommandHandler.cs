using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.InsuranceCompanies.DeleteInsuranceCompany
{
    public sealed class DeleteInsuranceCompanyCommandHandler : CommandHandlerBase, IRequestHandler<DeleteInsuranceCompanyCommand>
    {
        private readonly IInsuranceCompanyRepository _insuranceCompanyRepository;

        public DeleteInsuranceCompanyCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IInsuranceCompanyRepository insuranceCompanyRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _insuranceCompanyRepository = insuranceCompanyRepository;
        }

        public async Task Handle(DeleteInsuranceCompanyCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Support.InsuranceCompany? insuranceCompany = await _insuranceCompanyRepository.GetByIdAsync(request.Id);

            if (insuranceCompany == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Insurance company not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            _insuranceCompanyRepository.SoftDeleteSingle(
                insuranceCompany,
                request.IsHard,
                ct
            );

            await CommitAsync();
        }
    }
}
