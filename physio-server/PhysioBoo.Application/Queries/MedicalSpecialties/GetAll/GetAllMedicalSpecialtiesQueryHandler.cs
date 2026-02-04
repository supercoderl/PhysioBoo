using MediatR;
using PhysioBoo.Application.ViewModels.MedicalSpecialties;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;
using System.Linq.Expressions;

namespace PhysioBoo.Application.Queries.MedicalSpecialties.GetAll
{
    public sealed class GetAllMedicalSpecialtiesQueryHandler : IRequestHandler<GetAllMedicalSpecialtiesQuery, PagedResult<MedicalSpecialtyViewModel>>
    {
        private readonly IMedicalSpecialtyRepository _medicalSpecialtyRepository;

        public GetAllMedicalSpecialtiesQueryHandler(
            IMedicalSpecialtyRepository medicalSpecialtyRepository
        )
        {
            _medicalSpecialtyRepository = medicalSpecialtyRepository;
        }

        public async Task<PagedResult<MedicalSpecialtyViewModel>> Handle(GetAllMedicalSpecialtiesQuery q, CancellationToken cancellationToken)
        {
            PagedRequest<MedicalSpecialtyFilter> req = q.Request;
            Expression<Func<MedicalSpecialty, bool>>? predicate = null;

            if (req.Filter != null)
            {

            }

            Func<IQueryable<MedicalSpecialty>, IOrderedQueryable<MedicalSpecialty>>? orderBy = null;
            if (!string.IsNullOrEmpty(req.Sort))
            {
                if (req.Sort.Equals("createdAt", StringComparison.OrdinalIgnoreCase))
                    orderBy = q => q.OrderByDescending(u => u.CreatedAt);
            }

            PagedResult<MedicalSpecialty> paged = await _medicalSpecialtyRepository.GetPagedAsync(
                pageNumber: req.PageNumber,
                pageSize: req.PageSize,
                filter: predicate,
                orderBy: orderBy,
                cancellationToken: cancellationToken
            );

            // Map to view model
            List<MedicalSpecialtyViewModel> items = paged.Items.Select(ms => MedicalSpecialtyViewModel.FromMedicalSpecialty(ms)).ToList();
            return new PagedResult<MedicalSpecialtyViewModel>(paged.TotalCount, items, req.PageNumber, req.PageSize);
        }
    }
}
