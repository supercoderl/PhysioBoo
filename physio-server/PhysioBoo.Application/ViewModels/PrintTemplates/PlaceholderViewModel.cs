namespace PhysioBoo.Application.ViewModels.PrintTemplates
{
    public sealed class PlaceholderGroupViewModel
    {
        public string Group { get; set; }
        public IReadOnlyList<PlaceholderFieldViewModel> Fields { get; set; }

        public PlaceholderGroupViewModel(string group, IReadOnlyList<PlaceholderFieldViewModel> fields)
        {
            Group = group;
            Fields = fields;
        }
    }

    public sealed class PlaceholderFieldViewModel
    {
        public string Key { get; set; }
        public string Label { get; set; }
        public string? Example { get; set; }

        public PlaceholderFieldViewModel(string key, string label, string? example)
        {
            Key = key;
            Label = label;
            Example = example;
        }
    }
}
