using PhysioBoo.Application.ViewModels.PrintTemplates;

namespace PhysioBoo.Application.Interfaces
{
    public interface ITemplateDictionaryService
    {
        public object GenerateDictionary(Type type);

        /// <summary>
        /// Returns placeholder groups available for a given module.
        /// Universal groups (no Modules attribute) always appear.
        /// </summary>
        public IReadOnlyList<PlaceholderGroupViewModel> GetPlaceholderGroups(string? module = null);

        /// <summary>
        /// Discover groups across assemblies. Called once at startup, cached.
        /// </summary>
        public void RefreshCache();
    }
}
