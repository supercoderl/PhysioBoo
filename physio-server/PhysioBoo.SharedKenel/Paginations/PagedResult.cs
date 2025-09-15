namespace PhysioBoo.SharedKenel.ViewModels
{
    // SUPPORTING CLASSES
    public class PagedResult<T>
    {
        public IEnumerable<T> Items { get; init; } = Array.Empty<T>();
        public int TotalCount { get; init; }
        public int PageNumber { get; init; }
        public int PageSize { get; init; }
        public int TotalPages { get; init; }
        public bool HasPrevious => PageNumber > 1;
        public bool HasNext => PageNumber < TotalPages;

        public PagedResult(int totalCount, IList<T> items, int pageNumber, int pageSize)
        {
            TotalCount = totalCount;
            Items = items;
            PageNumber = pageNumber;
            PageSize = pageSize;
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        }

        // used by json deserializer
        private PagedResult()
        {
        }

        public static PagedResult<T> Empty()
        {
            return new PagedResult<T>
            {
                TotalCount = 0,
                Items = Array.Empty<T>(),
                PageNumber = 1,
                PageSize = 10,
                TotalPages = 0
            };
        }
    }
}
