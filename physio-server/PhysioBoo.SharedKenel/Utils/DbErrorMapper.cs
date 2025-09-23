using Npgsql;

namespace PhysioBoo.SharedKernel.Utils
{
    public static class DbErrorMapper
    {
        public static string Map(Exception ex)
        {
            if (ex is PostgresException pgEx)
            {
                return pgEx.SqlState switch
                {
                    "23505" => "Duplicate value: " + pgEx.Detail,
                    "23503" => "Foreign key violation: " + pgEx.Detail,
                    "23502" => "Null value violation: " + pgEx.Detail,
                    _ => $"DB error {pgEx.SqlState}: {pgEx.MessageText}"
                };
            }

            return $"Unexpected error: {ex.Message}";
        }
    }
}
