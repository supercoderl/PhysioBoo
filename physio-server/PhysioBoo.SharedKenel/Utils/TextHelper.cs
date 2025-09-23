namespace PhysioBoo.SharedKernel.Utils
{
    public static class TextHelper
    {
        public static string Pluralize(string name)
        {
            if (string.IsNullOrEmpty(name)) return name;

            // If end by "y" but before that there is no vowel → change "y" to "ies"
            if (name.EndsWith("y", StringComparison.OrdinalIgnoreCase) &&
                !"aeiou".Contains(name[name.Length - 2]))
            {
                return name.Substring(0, name.Length - 1) + "ies";
            }

            // If ending with "s", "x", "z", "ch", "sh" → add "es"
            if (name.EndsWith("s", StringComparison.OrdinalIgnoreCase) ||
                name.EndsWith("x", StringComparison.OrdinalIgnoreCase) ||
                name.EndsWith("z", StringComparison.OrdinalIgnoreCase) ||
                name.EndsWith("ch", StringComparison.OrdinalIgnoreCase) ||
                name.EndsWith("sh", StringComparison.OrdinalIgnoreCase))
            {
                return name + "es";
            }

            //Default just need +s
            return name + "s";
        }
    }
}
