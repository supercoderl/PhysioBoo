using MediatR;
using PhysioBoo.Application.ViewModels.PrintTemplates;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.System;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.PrintTemplates.GetAll
{
    public sealed class GetAllPrintTemplatesQueryHandler : IRequestHandler<GetAllPrintTemplatesQuery, PagedResult<PrintTemplateViewModel>>
    {
        private readonly IPrintTemplateRepository _PrintTemplateRepository;
        private readonly ISortingExpressionProvider<PrintTemplateViewModel, PrintTemplate> _sortingExpressionProvider;

        public GetAllPrintTemplatesQueryHandler(
            IPrintTemplateRepository PrintTemplateRepository,
            ISortingExpressionProvider<PrintTemplateViewModel, PrintTemplate> sortingExpressionProvider
        )
        {
            _PrintTemplateRepository = PrintTemplateRepository;
            _sortingExpressionProvider = sortingExpressionProvider;
        }

        public async Task<PagedResult<PrintTemplateViewModel>> Handle(GetAllPrintTemplatesQuery q, CancellationToken ct)
        {
            PrintTemplatesSearchSpec spec = new PrintTemplatesSearchSpec(q, _sortingExpressionProvider);

            PagedResult<PrintTemplate> paged = await _PrintTemplateRepository.ListAsync(
                spec,
                q.Request.PageNumber,
                q.Request.PageSize,
                ct
            );

            // Map to view model
            List<PrintTemplateViewModel> items = paged.Items.Select(pt => PrintTemplateViewModel.FromPrintTemplate(pt)).ToList();
            return new PagedResult<PrintTemplateViewModel>(paged.TotalCount, items, q.Request.PageNumber, q.Request.PageSize);
        }
    }
}
