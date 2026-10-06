using PhysioBoo.Application.ViewModels.Members;
using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Members.GetById
{
    public sealed class GetMemberByIdQueryHandler : IRequestHandler<GetMemberByIdQuery, MemberViewModel?>
    {
        private readonly IMemberRepository _memberRepository;
        private readonly IMediatorHandler _bus;

        public GetMemberByIdQueryHandler(
            IMemberRepository memberRepository,
            IMediatorHandler bus
        )
        {
            _memberRepository = memberRepository;
            _bus = bus;
        }

        public async Task<MemberViewModel?> Handle(GetMemberByIdQuery request, CancellationToken cancellationToken)
        {
            // GetWithLinksAsync, not GetByIdAsync: the view model needs Patient -> Profile (gotcha 4)
            MemberPoint? member = await _memberRepository.GetWithLinksAsync(request.Id, cancellationToken);
            if (member == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetMemberByIdQuery),
                    $"Member with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return null;
            }

            return MemberViewModel.FromEntity(member);
        }
    }
}
