using PhysioBoo.Application.Interfaces;
using Scriban;
using Scriban.Runtime;
using System.Text.Json;

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
            // Render data posted by the client arrives as JsonElement; Scriban cannot walk into those.
            if (v is JsonElement json) return FromJson(json);
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

        private static object? FromJson(JsonElement json)
        {
            switch (json.ValueKind)
            {
                case JsonValueKind.Object:
                    ScriptObject so = new ScriptObject();
                    foreach (JsonProperty p in json.EnumerateObject())
                        so[p.Name] = FromJson(p.Value);
                    return so;
                case JsonValueKind.Array:
                    return json.EnumerateArray().Select(FromJson).ToList();
                case JsonValueKind.String:
                    return json.GetString();
                case JsonValueKind.Number:
                    return json.TryGetInt64(out long l) ? l : json.GetDecimal();
                case JsonValueKind.True:
                    return true;
                case JsonValueKind.False:
                    return false;
                default:
                    return null;
            }
        }
    }
}
