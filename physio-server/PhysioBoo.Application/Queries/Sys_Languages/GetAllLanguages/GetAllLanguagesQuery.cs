using MediatR;
using PhysioBoo.Application.ViewModels.Sys_Languages;

namespace PhysioBoo.Application.Queries.Sys_Languages.GetAllLanguages
{
    public sealed record GetAllLanguagesQuery() : IRequest<List<LanguageViewModel>>;
}
