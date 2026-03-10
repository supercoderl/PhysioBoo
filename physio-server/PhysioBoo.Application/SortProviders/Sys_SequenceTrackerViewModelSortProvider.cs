using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Application.ViewModels.Sys_SequenceTrackers;
using PhysioBoo.Domain.Entities.System;
using System.Linq.Expressions;

namespace PhysioBoo.Application.SortProviders
{
    public sealed class Sys_SequenceTrackerViewModelSortProvider : ISortingExpressionProvider<Sys_SequenceTrackerViewModel, Sys_SequenceTracker>
    {
        private static readonly Dictionary<string, Expression<Func<Sys_SequenceTracker, object>>> s_expressions = new()
        {
            { "entitytype", sequenceTracker => sequenceTracker.EntityType },
            { "createdat", user => user.CreatedAt }
        };

        public Dictionary<string, Expression<Func<Sys_SequenceTracker, object>>> GetSortingExpressions()
        {
            return s_expressions;
        }
    }
}
