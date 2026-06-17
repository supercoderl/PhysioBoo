using MediatR;
using PhysioBoo.Application.ViewModels.PrintTemplates;

namespace PhysioBoo.Application.Queries.PrintTemplates.GetByCode
{
    public sealed record GetPrintTemplateByCodeQuery(string Code) : IRequest<PrintTemplateViewModel?>;
}
