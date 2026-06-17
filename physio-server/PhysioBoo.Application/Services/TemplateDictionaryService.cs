using PhysioBoo.Application.Interfaces;
using PhysioBoo.Application.ViewModels.PrintTemplates;
using PhysioBoo.SharedKernel.Attributes;
using System.Collections.Concurrent;
using System.Reflection;

namespace PhysioBoo.Application.Services
{
    public class TemplateDictionaryService : ITemplateDictionaryService
    {
        // Stores the FULL discovered catalog (every group regardless of module)
        private IReadOnlyList<DiscoveredGroup>? _allGroups;

        // Per-module cache of the filtered, DTO-shaped result
        private readonly ConcurrentDictionary<string, IReadOnlyList<PlaceholderGroupViewModel>> _cache = new();

        private static readonly Assembly[] ScanAssemblies =
        {
            // Scan the assembly that contains the context classes.
            // If you add contexts elsewhere, append more assemblies here.
            typeof(TemplateDictionaryService).Assembly
        };

        public object GenerateDictionary(Type type)
        {
            List<object> standardFields = new List<object>();
            List<object> collections = new List<object>();

            foreach (PropertyInfo prop in type.GetProperties())
            {
                // 1. Check for standard tags
                PrintTagAttribute? tagAttr = prop.GetCustomAttribute<PrintTagAttribute>();
                if (tagAttr != null)
                {
                    standardFields.Add(new { Label = tagAttr.Label, Tag = $"{{{{{prop.Name}}}}}" });
                }

                // 2. Check for Collections (Lists) to power the Table Builder
                PrintCollectionAttribute? collAttr = prop.GetCustomAttribute<PrintCollectionAttribute>();
                if (collAttr != null)
                {
                    // Find out what type of list it is (e.g., MedicationDto)
                    Type listItemType = prop.PropertyType.GetGenericArguments()[0];

                    collections.Add(new
                    {
                        CollectionName = collAttr.CollectionName,
                        LoopTag = prop.Name, // e.g., "Medications"
                                             // Recursively get the columns for the table builder!
                        AvailableColumns = GetColumnsForList(listItemType)
                    });
                }
            }

            return new { StandardFields = standardFields, Collections = collections };
        }

        public IReadOnlyList<PlaceholderGroupViewModel> GetPlaceholderGroups(string? module = null)
        {
            EnsureDiscovered();

            string moduleKey = module?.Trim().ToLowerInvariant() ?? "__universal__";
            return _cache.GetOrAdd(moduleKey, _ => BuildForModule(module));
        }

        public void RefreshCache()
        {
            _allGroups = null;
            _cache.Clear();
        }

        private List<object> GetColumnsForList(Type listItemType)
        {
            List<object> columns = new List<object>();
            foreach (PropertyInfo prop in listItemType.GetProperties())
            {
                PrintTagAttribute? tagAttr = prop.GetCustomAttribute<PrintTagAttribute>();
                if (tagAttr != null)
                {
                    // Note: Handlebars inside a loop just uses the property name directly
                    columns.Add(new { Label = tagAttr.Label, Tag = $"{{{{{prop.Name}}}}}" });
                }
            }
            return columns;
        }

        // ──────────────────────────────────────────────────────────────────
        // Discovery
        // ──────────────────────────────────────────────────────────────────

        private void EnsureDiscovered()
        {
            if (_allGroups != null) return;

            List<DiscoveredGroup> discovered = new List<DiscoveredGroup>();

            foreach (Assembly asm in ScanAssemblies)
            {
                foreach (Type type in SafeGetTypes(asm))
                {
                    PlaceholderGroupAttribute? groupAttr = type.GetCustomAttribute<PlaceholderGroupAttribute>();
                    if (groupAttr is null) continue;

                    List<PlaceholderFieldViewModel> fields = DiscoverFields(type, groupAttr.Base);
                    if (fields.Count == 0) continue;

                    discovered.Add(new DiscoveredGroup(
                        Order: groupAttr.Order,
                        Name: groupAttr.Name,
                        Modules: groupAttr.Modules,
                        Fields: fields
                    ));
                }
            }

            _allGroups = discovered
                .OrderBy(g => g.Order)
                .ThenBy(g => g.Name, StringComparer.OrdinalIgnoreCase)
                .ToList();
        }

        private static List<PlaceholderFieldViewModel> DiscoverFields(Type contextType, string basePath)
        {
            List<PlaceholderFieldViewModel> fields = new List<PlaceholderFieldViewModel>();

            foreach (PropertyInfo prop in contextType.GetProperties(BindingFlags.Public | BindingFlags.Instance))
            {
                if (prop.GetCustomAttribute<NoPlaceholderAttribute>() != null) continue;
                // Skip indexers
                if (prop.GetIndexParameters().Length > 0) continue;

                PlaceholderAttribute? attr = prop.GetCustomAttribute<PlaceholderAttribute>();
                string key = attr?.Key ?? Combine(basePath, ToCamelCase(prop.Name));
                string label = attr?.Label ?? Humanize(prop.Name);
                string? example = attr?.Example;

                fields.Add(new PlaceholderFieldViewModel(key, label, example));
            }

            return fields;
        }

        // ──────────────────────────────────────────────────────────────────
        // Per-module filtering
        // ──────────────────────────────────────────────────────────────────

        private IReadOnlyList<PlaceholderGroupViewModel> BuildForModule(string? module)
        {
            string? moduleLower = module?.Trim().ToLowerInvariant();

            return _allGroups!
                .Where(g => g.Modules.Length == 0 ||
                            (moduleLower != null &&
                             g.Modules.Any(m => string.Equals(m, moduleLower, StringComparison.OrdinalIgnoreCase))))
                .Select(g => new PlaceholderGroupViewModel(g.Name, g.Fields))
                .ToList();
        }

        // ──────────────────────────────────────────────────────────────────
        // Helpers
        // ──────────────────────────────────────────────────────────────────

        private static IEnumerable<Type> SafeGetTypes(Assembly asm)
        {
            try { return asm.GetTypes(); }
            catch (ReflectionTypeLoadException ex) { return ex.Types.Where(t => t != null)!; }
        }

        private static string Combine(string @base, string suffix) =>
            string.IsNullOrWhiteSpace(@base) ? suffix : $"{@base}.{suffix}";

        private static string ToCamelCase(string s) =>
            string.IsNullOrEmpty(s) || char.IsLower(s[0]) ? s : char.ToLowerInvariant(s[0]) + s.Substring(1);

        /// <summary>"FullName" → "Full name", "DateOfBirth" → "Date of birth".</summary>
        private static string Humanize(string name)
        {
            if (string.IsNullOrWhiteSpace(name)) return name;
            System.Text.StringBuilder sb = new System.Text.StringBuilder(name.Length + 8);
            for (int i = 0; i < name.Length; i++)
            {
                char c = name[i];
                if (i > 0 && char.IsUpper(c) && !char.IsUpper(name[i - 1])) sb.Append(' ');
                sb.Append(i == 0 ? char.ToUpperInvariant(c) : char.ToLowerInvariant(c));
            }
            return sb.ToString();
        }

        private sealed record DiscoveredGroup(
            int Order,
            string Name,
            string[] Modules,
            IReadOnlyList<PlaceholderFieldViewModel> Fields);
    }
}
