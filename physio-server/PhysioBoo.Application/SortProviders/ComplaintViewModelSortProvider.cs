using PhysioBoo.Application.ViewModels.Complaints;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Crm;
using System.Linq.Expressions;

namespace PhysioBoo.Application.SortProviders
{
    public sealed class ComplaintViewModelSortProvider : ISortingExpressionProvider<ComplaintViewModel, Complaint>
    {
        private static readonly Dictionary<string, Expression<Func<Complaint, object>>> s_expressions = new()
        {
            { "ticketnumber", x => x.TicketNumber }, { "patientname", x => x.PatientName },
            { "subject", x => x.Subject }, { "category", x => x.Category },
            { "priority", x => x.Priority }, { "status", x => x.Status },
            { "createdat", x => x.CreatedAt }, { "resolvedat", x => x.ResolvedAt! },
            { "updatedat", x => x.UpdatedAt ?? x.CreatedAt }
        };

        public Dictionary<string, Expression<Func<Complaint, object>>> GetSortingExpressions()
        {
            return s_expressions;
        }
    }
}
