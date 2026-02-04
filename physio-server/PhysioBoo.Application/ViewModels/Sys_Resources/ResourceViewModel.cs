using PhysioBoo.Domain.Entities.System;

namespace PhysioBoo.Application.ViewModels.Sys_Resources
{
    public sealed class ResourceViewModel
    {
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;

        public static ResourceViewModel FromResource(Sys_Resource resource)
        {
            return new ResourceViewModel
            {
                Key = resource.Key,
                Value = resource.Value
            };
        }
    }
}
