using MediatR;
using PhysioBoo.Application.ViewModels.PrintTemplates;
using PhysioBoo.Domain.Entities.System;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Queries.PrintTemplates.GetById
{
    public sealed class GetPrintTemplateByIdQueryHandler : IRequestHandler<GetPrintTemplateByIdQuery, PrintTemplateViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly IPrintTemplateRepository _printTemplateRepository;

        public GetPrintTemplateByIdQueryHandler(
            IMediatorHandler bus,
            IPrintTemplateRepository printTemplateRepository
        )
        {
            _bus = bus;
            _printTemplateRepository = printTemplateRepository;
        }

        public async Task<PrintTemplateViewModel?> Handle(GetPrintTemplateByIdQuery request, CancellationToken ct)
        {
            PrintTemplate? printTemplate = await _printTemplateRepository.GetByIdAsync(request.Id, includeProperties: "PrintTemplateVersion", ct: ct);

            if (printTemplate == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetPrintTemplateByIdQuery),
                    $"Print template with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            return PrintTemplateViewModel.FromPrintTemplate(printTemplate);
        }
    }
}
