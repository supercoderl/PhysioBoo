using MediatR;
using PhysioBoo.Application.ViewModels.PrintTemplates;

namespace PhysioBoo.Application.Queries.PrintTemplates.Render
{
    public sealed record RenderPrintTemplateQuery(string? TemplateCode, Guid? TemplateId, Dictionary<string, object?> Data) : IRequest<PrintTemplateRender?>;
}
