using MediatR;
using PhysioBoo.Application.ViewModels.PrintTemplates;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.PrintTemplates.GetAll
{
    public sealed record GetAllPrintTemplatesQuery(
        PagedRequest<PrintTemplateFilter> Request
    ) : IRequest<PagedResult<PrintTemplateViewModel>>;
}
