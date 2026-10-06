using PhysioBoo.Application.ViewModels.Admissions;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Admissions.GetById
{
    public sealed class GetAdmissionByIdQueryHandler : IRequestHandler<GetAdmissionByIdQuery, AdmissionViewModel?>
    {
        private readonly IAdmissionRepository _admissionRepository;
        private readonly IBedAssignmentRepository _bedAssignmentRepository;
        private readonly IMediatorHandler _bus;

        public GetAdmissionByIdQueryHandler(
            IAdmissionRepository admissionRepository,
            IBedAssignmentRepository bedAssignmentRepository,
            IMediatorHandler bus
        )
        {
            _admissionRepository = admissionRepository;
            _bedAssignmentRepository = bedAssignmentRepository;
            _bus = bus;
        }

        public async Task<AdmissionViewModel?> Handle(GetAdmissionByIdQuery request, CancellationToken cancellationToken)
        {
            // GetWithLinksAsync, not GetByIdAsync: the view model needs patient, department and doctor names (gotcha 4)
            Admission? admission = await _admissionRepository.GetWithLinksAsync(request.Id, cancellationToken);
            if (admission == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetAdmissionByIdQuery),
                    $"Admission with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return null;
            }

            Dictionary<Guid, BedAssignment> stays = await OpenStayLoader.LoadAsync(
                _bedAssignmentRepository,
                new[] { admission.Id },
                cancellationToken);

            return AdmissionViewModel.FromEntity(admission, stays.GetValueOrDefault(admission.Id));
        }
    }
}
