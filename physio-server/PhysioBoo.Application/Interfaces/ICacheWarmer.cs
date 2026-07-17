namespace PhysioBoo.Application.Interfaces
{
    public interface ICacheWarmer
    {
        Task WarmAsync(CancellationToken cancellationToken = default);
    }
}
