using MediatR;
using PhysioBoo.Application.ViewModels.PrintTemplates;

namespace PhysioBoo.Application.Queries.PrintTemplates.GetById
{
    public sealed record GetPrintTemplateByIdQuery(Guid Id) : IRequest<PrintTemplateViewModel?>;
}
