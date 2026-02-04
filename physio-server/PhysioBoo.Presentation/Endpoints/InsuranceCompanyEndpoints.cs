using PhysioBoo.Application.Commands.InsuranceCompanies.CreateInsuranceCompany;
using PhysioBoo.Application.ViewModels.InsuranceCompanies;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class InsuranceCompanyEndpoints
    {
        public static void MapInsuranceCompanyEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/insurance-companies")
                .WithTags("Insurance Companies")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create insurance company
            group.MapPost("/create", async (
                CreateInsuranceCompanyViewModel newInsuranceCompany,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateInsuranceCompanyCommand(newInsuranceCompany));

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
