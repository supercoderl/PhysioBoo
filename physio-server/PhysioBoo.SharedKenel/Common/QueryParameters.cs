namespace PhysioBoo.SharedKernel.Common
{
    /// <summary>
    /// Universal query parameters supporting paging, sorting, filtering, and searching.
    /// </summary>
    public class QueryParameters
    {
        private const int MaxPageSize = 100;

        private int _pageSize = 20;
        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = (value > MaxPageSize) ? MaxPageSize : value;
        }

        public int PageNumber { get; set; } = 1;

        /// <summary>
        /// Global search keyword, applied to multiple fields depending on entity.
        /// </summary>
        public string? Search { get; set; }

        /// <summary>
        /// Sorting format: "field:asc" or "field:desc". 
        /// Supports multiple fields: "name:asc,createdAt:desc".
        /// </summary>
        public string? Sort { get; set; }

        /// <summary>
        /// Dynamic filters, e.g. status=active, role=doctor
        /// </summary>
        public Dictionary<string, string>? Filters { get; set; }

        /// <summary>
        /// Optional flags for caching or export modes.
        /// </summary>
        public bool? DisableCache { get; set; } = false;
        public bool? Export { get; set; } = false;
    }
}
