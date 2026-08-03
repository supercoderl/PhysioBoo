using MediatR;
using PhysioBoo.Application.ViewModels.Manufacturers;
using PhysioBoo.Domain.Entities.Support;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Queries.Manufacturers.GetById
{
    public sealed class GetManufacturerByIdQueryHandler : IRequestHandler<GetManufacturerByIdQuery, ManufacturerViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly IManufacturerRepository _manufacturerRepository;

        public GetManufacturerByIdQueryHandler(
            IMediatorHandler bus,
            IManufacturerRepository manufacturerRepository
        )
        {
            _bus = bus;
            _manufacturerRepository = manufacturerRepository;
        }

        public async Task<ManufacturerViewModel?> Handle(GetManufacturerByIdQuery request, CancellationToken ct)
        {
            Manufacturer? manufacturer = await _manufacturerRepository.GetByIdAsync(request.Id, ct: ct);

            if (manufacturer == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetManufacturerByIdQuery),
                    $"Manufacturer with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            return ManufacturerViewModel.FromManufacturer(manufacturer);
        }
    }
}
