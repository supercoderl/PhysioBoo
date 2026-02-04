namespace PhysioBoo.Application.ViewModels.Sys_MediaFiles
{
    public sealed record CreateMediaViewModel(
        Guid Id,
        string PublicId,
        string Url,
        string RefType,
        Guid? RefId
    );
}
