using PhysioBoo.Application.Interfaces;
using PhysioBoo.SharedKernel.Attributes;
using System.Reflection;

namespace PhysioBoo.Application.Services
{
    public class TemplateDictionaryService : ITemplateDictionaryService
    {
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
    }
}
