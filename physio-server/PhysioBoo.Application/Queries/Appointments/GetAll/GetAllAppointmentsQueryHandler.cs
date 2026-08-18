using MediatR;
using PhysioBoo.Application.ViewModels.Appointments;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Appointments.GetAll
{
    public sealed class GetAllAppointmentsQueryHandler : IRequestHandler<GetAllAppointmentsQuery, PagedResult<AppointmentViewModel>>
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly ISortingExpressionProvider<AppointmentViewModel, Appointment> _sortingExpressionProvider;

        public GetAllAppointmentsQueryHandler(
            IAppointmentRepository appointmentRepository,
            ISortingExpressionProvider<AppointmentViewModel, Appointment> sortingExpressionProvider
        )
        {
            _appointmentRepository = appointmentRepository;
            _sortingExpressionProvider = sortingExpressionProvider;
        }

        public async Task<PagedResult<AppointmentViewModel>> Handle(GetAllAppointmentsQuery q, CancellationToken ct)
        {
            AppointmentsSearchSpec spec = new AppointmentsSearchSpec(q, _sortingExpressionProvider);

            PagedResult<Appointment> paged = await _appointmentRepository.ListAsync(
                spec,
                q.Request.PageNumber,
                q.Request.PageSize,
                ct
            );

            // Map to view model
            List<AppointmentViewModel> items = paged.Items.Select(AppointmentViewModel.FromEntity).ToList();
            return new PagedResult<AppointmentViewModel>(paged.TotalCount, items, q.Request.PageNumber, q.Request.PageSize);
        }
    }
}
