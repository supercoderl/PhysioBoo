namespace PhysioBoo.SharedKernel.Results
{
    public class DbResult<TKey>
    {
        public bool Success { get; }
        public TKey? Id { get; }
        public string? Error { get; }

        private DbResult(bool success, TKey? id, string? error)
        {
            Success = success;
            Id = id;
            Error = error;
        }

        public static DbResult<TKey> Ok(TKey id) => new(true, id, null);
        public static DbResult<TKey> Fail(string error) => new(false, default, error);
    }
}
