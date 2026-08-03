namespace PhysioBoo.Application.Interfaces
{
    public interface IResourceExcelProcessor
    {
        public Task<(int Inserted, int Updated)> ProcessAsync(Stream stream, CancellationToken ct);
    }
}
