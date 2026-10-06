using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.BedMap
{
    // The UI uses display strings ("ICU", "Surgical Recovery"); the enum cannot contain a space.
    public static class BedTypeText
    {
        public static string ToText(BedType type)
        {
            return type == BedType.SurgicalRecovery ? "Surgical Recovery" : type.ToString();
        }

        public static bool TryParse(string? text, out BedType type)
        {
            string normalized = (text ?? string.Empty).Replace(" ", string.Empty);
            return Enum.TryParse(normalized, true, out type) && Enum.IsDefined(type);
        }
    }
}
