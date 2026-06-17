using MediatR;
using PhysioBoo.Application.ViewModels.PrintTemplates;
using PhysioBoo.Domain.Entities.System;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Queries.PrintTemplates.GetByCode
{
    public sealed class GetPrintTemplateByCodeQueryHandler : IRequestHandler<GetPrintTemplateByCodeQuery, PrintTemplateViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly IPrintTemplateRepository _printTemplateRepository;

        public GetPrintTemplateByCodeQueryHandler(
            IMediatorHandler bus,
            IPrintTemplateRepository printTemplateRepository
        )
        {
            _bus = bus;
            _printTemplateRepository = printTemplateRepository;
        }

        public async Task<PrintTemplateViewModel?> Handle(GetPrintTemplateByCodeQuery request, CancellationToken cancellationToken)
        {
            PrintTemplate? printTemplate = await _printTemplateRepository.GetByCodeAsync(request.Code, cancellationToken: cancellationToken);

            if (printTemplate == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetPrintTemplateByCodeQuery),
                    $"Print template with code {request.Code} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            return PrintTemplateViewModel.FromPrintTemplate(printTemplate);
        }
    }
}
