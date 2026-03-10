using PhysioBoo.Application.ViewModels.LabTests;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using System.Linq.Expressions;

namespace PhysioBoo.Application.SortProviders
{
    public sealed class LabTestViewModelSortProvider : ISortingExpressionProvider<LabTestViewModel, LabTest>
    {
        private static readonly Dictionary<string, Expression<Func<LabTest, object>>> s_expressions = new()
        {
            { "name", labTest => labTest.TestName },
            { "code", labTest => labTest.TestCode ?? string.Empty },
            { "createdat", labTest => labTest.CreatedAt }
        };

        public Dictionary<string, Expression<Func<LabTest, object>>> GetSortingExpressions()
        {
            return s_expressions;
        }
    }
}
