namespace PhysioBoo.SharedKernel.Metadata
{
    public class TableMetadata
    {
        public string TableName { get; set; } = string.Empty;
        public string StagingTableName { get; set; } = string.Empty;
        public List<ColumnMetadata> Columns { get; set; } = new List<ColumnMetadata>();
        public List<ColumnMetadata> InsertableColumns { get; set; } = new List<ColumnMetadata>();
        public ColumnMetadata? KeyColumn { get; set; }
    }
}
