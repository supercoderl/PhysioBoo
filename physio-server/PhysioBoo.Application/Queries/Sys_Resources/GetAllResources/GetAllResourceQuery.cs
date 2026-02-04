using MediatR;

namespace PhysioBoo.Application.Queries.Sys_Resources.GetAllResources
{
    public sealed record GetAllResourceQuery(
        string LangCode
    ) : IRequest<string>;
}
