using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.InsuranceCompanies.CreateInsuranceCompany;
using PhysioBoo.Application.Commands.InsuranceCompanies.DeleteInsuranceCompany;
using PhysioBoo.Application.Commands.InsuranceCompanies.UpdateInsuranceCompany;
using PhysioBoo.Application.Queries.InsuranceCompanies.GetAll;
using PhysioBoo.Application.Queries.InsuranceCompanies.GetById;
using PhysioBoo.Application.ViewModels.InsuranceCompanies;
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
            #endregion

            #region Get All Insurance Companies
            group.MapPost("/search", async (
                [FromBody] PagedRequest<InsuranceCompanyFilter> request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                PagedResult<InsuranceCompanyViewModel> result = await bus.QueryAsync(new GetAllInsuranceCompaniesQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<InsuranceCompanyViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchInsuranceCompanies")
            .WithSummary("Retrieve a paginated list of insurance companies with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<InsuranceCompanyViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<InsuranceCompanyViewModel>>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Delete Insurance Company
            group.MapPost("/delete", async (
                DeleteInsuranceCompanyViewModel request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new DeleteInsuranceCompanyCommand(request.Id, request.IsHard));

                return Results.Ok(new ResponseMessage<string>
                {
                    Success = true,
                    Data = "Insurance company has been deleted successfully."
                });
            }).WithName("DeleteInsuranceCompany")
            .WithSummary("Handles requests to delete a specific record by its identifier and returns the appropriate result after the operation.")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Update Insurance Company
            group.MapPost("/update", async (
                UpdateInsuranceCompanyViewModel InsuranceCompany,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new UpdateInsuranceCompanyCommand(InsuranceCompany));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = InsuranceCompany.Id
                });
            }).WithName("UpdateInsuranceCompany")
            .WithSummary("Update insurance company")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Get Insurance Company By Id
            group.MapPost("/search-by-id", async (
                [FromBody] InsuranceCompanySingleFilter request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                InsuranceCompanyViewModel? result = await bus.QueryAsync(new GetInsuranceCompanyByIdQuery(request.Id));

                return Results.Ok(new ResponseMessage<InsuranceCompanyViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchInsuranceCompany")
            .WithSummary("Retrieve a insurance company record.")
            .Produces<ResponseMessage<InsuranceCompanyViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<InsuranceCompanyViewModel?>>(StatusCodes.Status400BadRequest);
            #endregion
        }
    }
}
