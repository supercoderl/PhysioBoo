namespace PhysioBoo.SharedKernel.Utils
{
    public static class EnumHelper
    {
        private static readonly Dictionary<(Type, string), Attribute?> _cache = new();

        public static TAttribute? GetAttribute<TEnum, TAttribute>(TEnum value)
            where TEnum : Enum
            where TAttribute : Attribute
        {
            (Type, string) key = (typeof(TEnum), value.ToString());

            if (_cache.TryGetValue(key, out Attribute? cached))
                return cached as TAttribute;

            System.Reflection.FieldInfo? field = typeof(TEnum).GetField(value.ToString());
            TAttribute? attribute = field?.GetCustomAttributes(typeof(TAttribute), false)
                                  .FirstOrDefault() as TAttribute;

            _cache[key] = attribute;

            return attribute;
        }
    }
}
