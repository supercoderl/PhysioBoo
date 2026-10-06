using PhysioBoo.Application.ViewModels.BedMap;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.BedMap.GetWards
{
    public sealed class GetWardsQueryHandler : IRequestHandler<GetWardsQuery, List<WardViewModel>>
    {
        private readonly IWardRepository _wardRepository;
        private readonly IBedRepository _bedRepository;

        public GetWardsQueryHandler(
            IWardRepository wardRepository,
            IBedRepository bedRepository
        )
        {
            _wardRepository = wardRepository;
            _bedRepository = bedRepository;
        }

        public async Task<List<WardViewModel>> Handle(GetWardsQuery request, CancellationToken cancellationToken)
        {
            return await WardViewModelBuilder.BuildAsync(_wardRepository, _bedRepository, cancellationToken);
        }
    }
}
