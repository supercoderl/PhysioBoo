using MediatR;
using PhysioBoo.Application.ViewModels.AppointmentTypes;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.AppointmentTypes.GetAll
{
    public sealed class GetAllAppointmentTypesQueryHandler : IRequestHandler<GetAllAppointmentTypesQuery, PagedResult<AppointmentTypeViewModel>>
    {
        private readonly IAppointmentTypeRepository _appointmentTypeRepository;
        private readonly ISortingExpressionProvider<AppointmentTypeViewModel, AppointmentType> _sortingExpressionProvider;

        public GetAllAppointmentTypesQueryHandler(
            IAppointmentTypeRepository appointmentTypeRepository,
            ISortingExpressionProvider<AppointmentTypeViewModel, AppointmentType> sortingExpressionProvider
        )
        {
            _appointmentTypeRepository = appointmentTypeRepository;
            _sortingExpressionProvider = sortingExpressionProvider;
        }

        public async Task<PagedResult<AppointmentTypeViewModel>> Handle(GetAllAppointmentTypesQuery q, CancellationToken cancellationToken)
        {
            AppointmentTypesSearchSpec spec = new AppointmentTypesSearchSpec(q, _sortingExpressionProvider);

            PagedResult<AppointmentType> paged = await _appointmentTypeRepository.ListAsync(
                spec,
                q.Request.PageNumber,
                q.Request.PageSize,
                cancellationToken
            );

            // Map to view model
            List<AppointmentTypeViewModel> items = paged.Items.Select(at => AppointmentTypeViewModel.FromAppointmentType(at)).ToList();
            return new PagedResult<AppointmentTypeViewModel>(paged.TotalCount, items, q.Request.PageNumber, q.Request.PageSize);
        }
    }
}
