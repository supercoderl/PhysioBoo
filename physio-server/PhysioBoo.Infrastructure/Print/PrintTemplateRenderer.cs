using PhysioBoo.Application.Interfaces;
using Scriban;
using Scriban.Runtime;

namespace PhysioBoo.Infrastructure.Print
{
    public class PrintTemplateRenderer : IPrintTemplateRenderer
    {
        public string Render(string templateHtml, IReadOnlyDictionary<string, object?> data)
        {
            if (string.IsNullOrEmpty(templateHtml)) return string.Empty;

            Template template = Template.Parse(templateHtml);
            if (template.HasErrors)
                return $"<!-- Template parse error: {string.Join("; ", template.Messages)} -->";

            TemplateContext ctx = new TemplateContext { StrictVariables = false, EnableRelaxedTargetAccess = true };
            ScriptObject so = new ScriptObject();
            // Import the dictionary as the root scope
            ImportInto(so, data);
            ctx.PushGlobal(so);

            // Helpers — handy in templates, e.g. {{ format_date date "yyyy-MM-dd" }}
            so.Import("format_date", (object? d, string fmt) =>
                d is DateTime dt ? dt.ToString(fmt)
                : d is DateTimeOffset dto ? dto.ToString(fmt)
                : d is DateOnly @do ? @do.ToString(fmt)
                : d?.ToString() ?? "");

            so.Import("money", (object? amount, string? currency) =>
                amount is null ? ""
                : $"{Convert.ToDecimal(amount):N0} {currency ?? "VND"}");

            so.Import("upper", (object? s) => s?.ToString()?.ToUpperInvariant() ?? "");

            return template.Render(ctx);
        }

        private static void ImportInto(ScriptObject target, IReadOnlyDictionary<string, object?> dict)
        {
            foreach ((string k, object? v) in dict)
                target[k] = ToScribanValue(v);
        }

        private static object? ToScribanValue(object? v)
        {
            if (v is IReadOnlyDictionary<string, object?> nested)
            {
                ScriptObject so = new ScriptObject();
                ImportInto(so, nested);
                return so;
            }
            if (v is System.Collections.IEnumerable enumerable && v is not string)
            {
                List<object?> list = new List<object?>();
                foreach (object? item in enumerable)
                {
                    if (item is IReadOnlyDictionary<string, object?> d)
                        list.Add(ToScribanValue(d));
                    else list.Add(item);
                }
                return list;
            }
            return v;
        }
    }
}
