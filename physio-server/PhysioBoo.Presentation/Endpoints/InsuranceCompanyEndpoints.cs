using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.InsuranceCompanies.CreateInsuranceCompany;
using PhysioBoo.Application.Commands.InsuranceCompanies.DeleteInsuranceCompany;
using PhysioBoo.Application.Commands.InsuranceCompanies.UpdateInsuranceCompany;
using PhysioBoo.Application.Queries.InsuranceCompanies.GetAll;
using PhysioBoo.Application.Queries.InsuranceCompanies.GetById;
using PhysioBoo.Application.ViewModels.InsuranceCompanies;
using PhysioBoo.Domain.Constants;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;
using PhysioBoo.SharedKernel.Common;

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

            #region Create New Insurance Company
            group.MapPost("", async (
                [FromBody] CreateInsuranceCompanyViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                Guid newId = Guid.NewGuid();
                await bus.SendCommandAsync(new CreateInsuranceCompanyCommand(request, newId));

                return Results.CreatedAtRoute(
                    "GetInsuranceCompanyById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newId
                    }
                );
            }).WithName("CreateInsuranceCompany")
            .WithSummary("Create new insurance company")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Admin.InsuranceCompanyCreate);
            #endregion

            #region Get All Insurance Companies
            group.MapPost("search", async (
                [FromBody] PagedRequest<InsuranceCompanyFilter> request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<InsuranceCompanyViewModel> result = await bus.QueryAsync(new GetAllInsuranceCompaniesQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<InsuranceCompanyViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetInsuranceCompanies")
            .WithSummary("Retrieve a paginated list of insurance companies with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<InsuranceCompanyViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<InsuranceCompanyViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Admin.InsuranceCompanyRead);
            #endregion

            #region Delete Insurance Company
            group.MapDelete("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new DeleteInsuranceCompanyCommand(id));

                return Results.NoContent();
            }).WithName("DeleteInsuranceCompany")
            .WithSummary("Handles requests to delete a specific insurance company by its identifier.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Admin.InsuranceCompanyDelete);
            #endregion

            #region Update Insurance Company
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] UpdateInsuranceCompanyViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpdateInsuranceCompanyCommand(request, id));

                return Results.NoContent();
            }).WithName("UpdateInsuranceCompany")
            .WithSummary("Update insurance company")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Admin.InsuranceCompanyUpdate);
            #endregion

            #region Get Insurance Company By Id
            group.MapGet("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                InsuranceCompanyViewModel? result = await bus.QueryAsync(new GetInsuranceCompanyByIdQuery(id));

                return Results.Ok(new ResponseMessage<InsuranceCompanyViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetInsuranceCompanyById")
            .WithSummary("Retrieve an insurance company record.")
            .Produces<ResponseMessage<InsuranceCompanyViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<InsuranceCompanyViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Admin.InsuranceCompanyRead);
            #endregion
        }
    }
}
