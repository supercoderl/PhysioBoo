using MediatR;
using PhysioBoo.Application.Commands.InsuranceCompanies.CreateInsuranceCompany;
using PhysioBoo.Application.ViewModels.InsuranceCompanies;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class InsuranceCompanyEndpoints
    {
        public static void MapInsuranceCompanyEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/insurance-companies")
                .WithTags("Insurance Companies")
                .WithOpenApi();

            // Create insurance company
            group.MapPost("/create", async (
                CreateInsuranceCompanyViewModel newInsuranceCompany,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateInsuranceCompanyCommand(newInsuranceCompany));

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

                return Results.Created($"/api/insurance-companies/{newInsuranceCompany.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newInsuranceCompany.Id
                });
            }).WithName("CreateInsuranceCompany")
            .WithSummary("Create new insurance company")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
