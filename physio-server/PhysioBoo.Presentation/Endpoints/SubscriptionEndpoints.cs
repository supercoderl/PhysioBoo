using PhysioBoo.Application.Commands.Subscriptions.ChangeSubscription;
using PhysioBoo.Application.Commands.Subscriptions.IssueInvoice;
using PhysioBoo.Application.Commands.Subscriptions.SavePlan;
using PhysioBoo.Application.Commands.Subscriptions.SettleInvoice;
using PhysioBoo.Application.Queries.Subscriptions.GetByTenant;
using PhysioBoo.Application.Queries.Subscriptions.GetPlans;
using PhysioBoo.Application.Queries.Subscriptions.Search;
using PhysioBoo.Application.ViewModels.Subscriptions;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Presentation.Endpoints
{
    /// <summary>
    /// Super-admin SaaS billing: plan catalog, per-tenant subscriptions and subscription invoices.
    /// </summary>
    public static class SubscriptionEndpoints
    {
        public static void MapSubscriptionEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/billing")
                .WithTags("Billing")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Plans
            group.MapGet("/plans", async ([FromQuery] bool? includeInactive, IMediatorHandler bus) =>
                Ok(await bus.QueryAsync(new GetSubscriptionPlansQuery(includeInactive ?? false))))
            .WithName("GetSubscriptionPlans")
            .Produces<ResponseMessage<List<SubscriptionPlanViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Subscription.PlanRead);

            group.MapPost("/plans", async ([FromBody] SaveSubscriptionPlanViewModel body, IMediatorHandler bus) =>
            {
                SaveSubscriptionPlanCommand command = new SaveSubscriptionPlanCommand(null, body);
                await bus.SendCommandAsync(command);
                return Ok(command.NewId);
            })
            .WithName("CreateSubscriptionPlan")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Subscription.PlanManage);

            group.MapPut("/plans/{id:guid}", async (Guid id, [FromBody] SaveSubscriptionPlanViewModel body, IMediatorHandler bus) =>
            {
                await bus.SendCommandAsync(new SaveSubscriptionPlanCommand(id, body));
                return Ok(id);
            })
            .WithName("UpdateSubscriptionPlan")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Subscription.PlanManage);
            #endregion

            #region Subscriptions
            group.MapGet("/subscriptions", async (
                [FromQuery] string? search,
                [FromQuery] string? status,
                [FromQuery] int? pageNumber,
                [FromQuery] int? pageSize,
                IMediatorHandler bus
            ) => Ok(await bus.QueryAsync(new SearchTenantSubscriptionsQuery(search, status, pageNumber ?? 1, pageSize ?? 20))))
            .WithName("SearchTenantSubscriptions")
            .WithSummary("Every tenant with its plan, status, period and outstanding invoices.")
            .Produces<ResponseMessage<PagedResult<TenantSubscriptionViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Subscription.SubscriptionRead);

            group.MapGet("/subscriptions/{hospitalGroupId:guid}", async (Guid hospitalGroupId, IMediatorHandler bus) =>
                Ok(await bus.QueryAsync(new GetTenantSubscriptionQuery(hospitalGroupId))))
            .WithName("GetTenantSubscription")
            .Produces<ResponseMessage<TenantSubscriptionDetailViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<TenantSubscriptionDetailViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Subscription.SubscriptionRead);

            group.MapPost("/subscriptions/{hospitalGroupId:guid}", async (Guid hospitalGroupId, [FromBody] ChangeSubscriptionViewModel body, IMediatorHandler bus) =>
            {
                if (!Enum.TryParse(body.Action, true, out SubscriptionAction action))
                {
                    return Results.BadRequest(new ResponseMessage<object>
                    {
                        Success = false,
                        Errors = new[] { "Action must be ChangePlan, Activate, MarkPastDue, Cancel or UpdateDetails." },
                        DetailedErrors = new[] { new DetailedError { Code = DomainErrorCodes.Subscription.InvalidAction } }
                    });
                }

                await bus.SendCommandAsync(new ChangeSubscriptionCommand(hospitalGroupId, action, body.PlanId, body.BillingEmail, body.Notes));
                return Ok(await bus.QueryAsync(new GetTenantSubscriptionQuery(hospitalGroupId)));
            })
            .WithName("ChangeTenantSubscription")
            .WithSummary("Change plan, activate, mark past due, cancel, or update billing details.")
            .Produces<ResponseMessage<TenantSubscriptionDetailViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Subscription.SubscriptionManage);
            #endregion

            #region Invoices
            group.MapPost("/subscriptions/{hospitalGroupId:guid}/invoices", async (Guid hospitalGroupId, IMediatorHandler bus) =>
            {
                await bus.SendCommandAsync(new IssueSubscriptionInvoiceCommand(hospitalGroupId));
                return Ok(await bus.QueryAsync(new GetTenantSubscriptionQuery(hospitalGroupId)));
            })
            .WithName("IssueSubscriptionInvoice")
            .WithSummary("Bill the tenant for its current period.")
            .Produces<ResponseMessage<TenantSubscriptionDetailViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Subscription.InvoiceManage);

            group.MapPost("/invoices/{id:guid}/pay", async (Guid id, [FromBody] SettleSubscriptionInvoiceViewModel? body, IMediatorHandler bus) =>
            {
                await bus.SendCommandAsync(new SettleSubscriptionInvoiceCommand(id, InvoiceSettlement.Pay, body?.PaymentReference));
                return Ok(id);
            })
            .WithName("PaySubscriptionInvoice")
            .WithSummary("Record payment (e.g. bank transfer reference). No card data is handled here.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Subscription.InvoiceManage);

            group.MapPost("/invoices/{id:guid}/void", async (Guid id, IMediatorHandler bus) =>
            {
                await bus.SendCommandAsync(new SettleSubscriptionInvoiceCommand(id, InvoiceSettlement.Void, null));
                return Ok(id);
            })
            .WithName("VoidSubscriptionInvoice")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Subscription.InvoiceManage);
            #endregion
        }

        private static IResult Ok<T>(T data)
        {
            return Results.Ok(new ResponseMessage<T>
            {
                Success = true,
                Data = data
            });
        }
    }
}
