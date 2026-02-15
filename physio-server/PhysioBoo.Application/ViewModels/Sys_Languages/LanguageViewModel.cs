using PhysioBoo.Domain.Entities.System;

namespace PhysioBoo.Application.ViewModels.Sys_Languages
{
    public sealed class LanguageViewModel
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public string? FlagUrl { get; set; }
        public bool IsDefault { get; set; }
        public string? NativeName { get; set; }
        public int Index { get; set; }

        public static LanguageViewModel FromLanguage(Sys_Language language)
        {
            return new LanguageViewModel
            {
                Id = language.Id,
                Code = language.Code,
                Name = language.Name,
                IsActive = language.IsActive,
                FlagUrl = language.FlagUrl,
                IsDefault = language.IsDefault,
                NativeName = language.NativeName,
                Index = language.Index
            };
        }
    }
}
