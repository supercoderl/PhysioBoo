using MediatR;
using PhysioBoo.Application.Commands.HospitalStaffs.CreateHospitalStaff;
using PhysioBoo.Application.ViewModels.HospitalStaffs;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class HospitalStaffEndpoints
    {
        public static void MapHospitalStaffEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/hospital-staffs")
                .WithTags("Hospital Staffs")
                .WithOpenApi();

            // Create hospital staff
            group.MapPost("/create", async (
                CreateHospitalStaffViewModel newHospitalStaff,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateHospitalStaffCommand(newHospitalStaff));

                if (notifications.HasNotifications())
                {
                    return Results.BadRequest(new ResponseMessage<Guid>
                    {
                        Success = false,
                        Errors = notifications.GetNotifications().Select(n => n.Value),
                        DetailedErrors = notifications.GetNotifications().Select(n => new DetailedError
                        {
                            Code = n.Code,
                            Data = n.Data
                        })
                    });
                }

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
