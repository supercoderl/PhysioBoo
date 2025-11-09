namespace PhysioBoo.SharedKernel.Common
{
    /// <summary>
    /// Strongly-typed filter request for specific entities.
    /// </summary>
    public class PagedRequest<TFilter> : QueryParameters
        where TFilter : class?
    {
        public TFilter? Filter { get; set; }
    }
}
