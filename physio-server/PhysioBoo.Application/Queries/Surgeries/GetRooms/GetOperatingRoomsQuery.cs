using PhysioBoo.Application.ViewModels.Surgeries;

namespace PhysioBoo.Application.Queries.Surgeries.GetRooms
{
    public sealed record GetOperatingRoomsQuery : IRequest<List<OperatingRoomViewModel>>;
}
