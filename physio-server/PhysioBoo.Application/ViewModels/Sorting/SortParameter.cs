namespace PhysioBoo.Application.ViewModels.Sorting
{
    public readonly struct SortParameter
    {
        public SortOrder Order { get; }
        public string ParameterName { get; }

        public SortParameter(string parameter, SortOrder order)
        {
            Order = order;
            ParameterName = parameter;
        }
    }
}
