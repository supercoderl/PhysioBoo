
using PhysioBoo.Application.ViewModels.AuditLogs;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.System;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.AuditLogs.GetById
{
    public sealed class GetAuditLogByIdQueryHandler : IRequestHandler<GetAuditLogByIdQuery, AuditLogViewModel?>
    {
        private readonly ISys_AuditLogRepository _auditLogRepository;
        private readonly IUserRepository _userRepository;

        public GetAuditLogByIdQueryHandler(
            ISys_AuditLogRepository auditLogRepository,
            IUserRepository userRepository
        )
        {
            _auditLogRepository = auditLogRepository;
            _userRepository = userRepository;
        }

        public async Task<AuditLogViewModel?> Handle(GetAuditLogByIdQuery request, CancellationToken ct)
        {
            Sys_AuditLog? log = await _auditLogRepository.GetByIdAsync(request.Id, ct: ct);

            if (log == null) return null;

            User? user = log.UserId.HasValue ? await _userRepository.GetByIdAsync(log.UserId.Value, ct: ct) : null;

            return AuditLogViewModel.FromEntity(log, user?.Email);
        }
    }
}
