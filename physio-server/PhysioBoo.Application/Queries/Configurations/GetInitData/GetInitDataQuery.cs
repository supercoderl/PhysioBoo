using MediatR;
using PhysioBoo.Application.ViewModels.Configurations;

namespace PhysioBoo.Application.Queries.Configurations.GetInitData
{
    public sealed record GetInitDataQuery() : IRequest<InitDataViewModel>;
}
