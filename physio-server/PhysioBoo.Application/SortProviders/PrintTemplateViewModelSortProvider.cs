using PhysioBoo.Application.ViewModels.PrintTemplates;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.System;
using System.Linq.Expressions;

namespace PhysioBoo.Application.SortProviders
{
    public sealed class PrintTemplateViewModelSortProvider : ISortingExpressionProvider<PrintTemplateViewModel, PrintTemplate>
    {
        private static readonly Dictionary<string, Expression<Func<PrintTemplate, object>>> s_expressions = new()
        {
            { "name", printTemplate => printTemplate.Name },
            { "code", printTemplate => printTemplate.Code },
            { "createdat", printTemplate => printTemplate.CreatedAt }
        };

        public Dictionary<string, Expression<Func<PrintTemplate, object>>> GetSortingExpressions()
        {
            return s_expressions;
        }
    }
}
