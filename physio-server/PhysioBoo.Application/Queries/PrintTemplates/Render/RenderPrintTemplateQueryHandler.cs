using MediatR;
using PhysioBoo.Application.Interfaces;
using PhysioBoo.Application.Queries.PrintTemplates.GetById;
using PhysioBoo.Application.ViewModels.PrintTemplates;
using PhysioBoo.Domain.Entities.System;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Queries.PrintTemplates.Render
{
    public sealed class RenderPrintTemplateQueryHandler : IRequestHandler<RenderPrintTemplateQuery, PrintTemplateRender?>
    {
        private readonly IMediatorHandler _bus;
        private readonly IPrintTemplateRepository _printTemplateRepository;
        private readonly IPrintTemplateVersionRepository _printTemplateVersionRepository;
        private readonly IPrintLogRepository _printLogRepository;
        private readonly IPrintContextEnricher _printContextEnricher;
        private readonly ITemplateDictionaryService _templateDictionaryService;
        private readonly IPrintTemplateRenderer _printTemplateRenderer;

        public RenderPrintTemplateQueryHandler(
            IMediatorHandler bus,
            IPrintTemplateRepository printTemplateRepository,
            IPrintTemplateVersionRepository printTemplateVersionRepository,
            IPrintLogRepository printLogRepository,
            IPrintContextEnricher printContextEnricher,
            ITemplateDictionaryService templateDictionaryService,
            IPrintTemplateRenderer printTemplateRenderer
        )
        {
            _bus = bus;
            _printTemplateRepository = printTemplateRepository;
            _printTemplateVersionRepository = printTemplateVersionRepository;
            _printLogRepository = printLogRepository;
            _printContextEnricher = printContextEnricher;
            _templateDictionaryService = templateDictionaryService;
            _printTemplateRenderer = printTemplateRenderer;
        }

        public async Task<PrintTemplateRender?> Handle(RenderPrintTemplateQuery request, CancellationToken cancellationToken)
        {
            PrintTemplate? template = null;
            PrintTemplateVersion? version = null;
            if (request.TemplateId.HasValue)
            {
                template = await _printTemplateRepository.GetByIdAsync(request.TemplateId.Value, cancellationToken: cancellationToken);
            }
            else if (request.TemplateCode != null)
            {
                template = await _printTemplateRepository.GetByCodeAsync(request.TemplateCode, cancellationToken);
            }

            if (template == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetPrintTemplateByIdQuery),
                    $"Template doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            version = await _printTemplateVersionRepository.GetByIdAsync(template.CurrentVersionId ?? Guid.Empty, cancellationToken: cancellationToken);

            if (version == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetPrintTemplateByIdQuery),
                    $"Version doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            IReadOnlyDictionary<string, object?> data = await _printContextEnricher.EnrichAsync(request.Data, cancellationToken);

            string header = _printTemplateRenderer.Render(version.HeaderHtml ?? string.Empty, data);
            string body = _printTemplateRenderer.Render(version.BodyHtml ?? string.Empty, data);
            string footer = _printTemplateRenderer.Render(version.FooterHtml ?? string.Empty, data);

            string html = $@"
                <div class=""print-document"">
                  <header class=""print-header"">{header}</header>
                  <main class=""print-body"">{body}</main>
                  <footer class=""print-footer"">{footer}</footer>
                </div>
            ";

            // Log the print action

            return new PrintTemplateRender(html, version.PaperSize, version.Orientation, version.CustomCss);
        }
    }
}
