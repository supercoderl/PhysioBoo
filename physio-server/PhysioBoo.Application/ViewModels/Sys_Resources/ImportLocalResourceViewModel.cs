using Microsoft.AspNetCore.Http;

namespace PhysioBoo.Application.ViewModels.Sys_Resources
{
    public sealed record ImportLocalResourceViewModel
    (
        IFormFile File
    );
}
