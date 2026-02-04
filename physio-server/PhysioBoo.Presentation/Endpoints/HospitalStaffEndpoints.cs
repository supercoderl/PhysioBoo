using PhysioBoo.Application.Commands.HospitalStaffs.CreateHospitalStaff;
using PhysioBoo.Application.ViewModels.HospitalStaffs;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class HospitalStaffEndpoints
    {
        public static void MapHospitalStaffEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/hospital-staffs")
                .WithTags("Hospital Staffs")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create hospital staff
            group.MapPost("/create", async (
                CreateHospitalStaffViewModel newHospitalStaff,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateHospitalStaffCommand(newHospitalStaff));

                return Results.Created($"/api/hospital-staffs/{newHospitalStaff.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newHospitalStaff.Id
                });
            }).WithName("CreateHospitalStaff")
            .WithSummary("Create new hospital staff")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
