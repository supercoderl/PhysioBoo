using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Application.ViewModels.StockTakes
{
    public sealed class StockTakeActivityViewModel
    {
        public Guid Id { get; set; }
        public Guid StockTakeId { get; set; }
        public string StockTakeCode { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Actor { get; set; } = string.Empty;
        public DateTime OccurredAt { get; set; }

        public static StockTakeActivityViewModel FromStockTakeActivity(StockTakeActivity activity)
        {
            return new StockTakeActivityViewModel
            {
                Id = activity.Id,
                StockTakeId = activity.StockTakeId,
                StockTakeCode = activity.StockTake?.Code ?? string.Empty,
                Type = activity.Type.ToString(),
                Message = activity.Message,
                Actor = activity.ActorUser?.Email ?? string.Empty,
                OccurredAt = activity.OccurredAt
            };
        }
    }
}
