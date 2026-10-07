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

        /// <summary>
        /// Self-service for the signed-in tenant (Settings > Billing). Always scoped to the caller's own
        /// tenant (TenantId is the HospitalGroup id), so no tenant id is accepted from the client.
        /// </summary>
        public static void MapMyBillingEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/billing/me")
                .WithTags("Billing")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            group.MapGet("/subscription", async (IUser user, IMediatorHandler bus) =>
                Ok(await bus.QueryAsync(new GetTenantSubscriptionQuery(user.GetTenantId()))))
            .WithName("GetMySubscription")
            .WithSummary("The current tenant's plan, status, period and invoices.")
            .Produces<ResponseMessage<TenantSubscriptionDetailViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Subscription.OwnRead);

            group.MapGet("/plans", async (IMediatorHandler bus) =>
                Ok(await bus.QueryAsync(new GetSubscriptionPlansQuery(false))))
            .WithName("GetMyAvailablePlans")
            .WithSummary("Plans the tenant can switch to.")
            .Produces<ResponseMessage<List<SubscriptionPlanViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Subscription.OwnRead);

            group.MapPost("/subscription/change-plan", async ([FromBody] ChangeMyPlanViewModel body, IUser user, IMediatorHandler bus) =>
            {
                Guid tenantId = user.GetTenantId();
                await bus.SendCommandAsync(new ChangeSubscriptionCommand(tenantId, SubscriptionAction.ChangePlan, body.PlanId, null, null));
                return Ok(await bus.QueryAsync(new GetTenantSubscriptionQuery(tenantId)));
            })
            .WithName("ChangeMyPlan")
            .WithSummary("Switch the tenant to another active plan (re-activates a cancelled subscription).")
            .Produces<ResponseMessage<TenantSubscriptionDetailViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Subscription.OwnManage);

            group.MapPost("/subscription/cancel", async (IUser user, IMediatorHandler bus) =>
            {
                Guid tenantId = user.GetTenantId();
                await bus.SendCommandAsync(new ChangeSubscriptionCommand(tenantId, SubscriptionAction.Cancel, null, null, null));
                return Ok(await bus.QueryAsync(new GetTenantSubscriptionQuery(tenantId)));
            })
            .WithName("CancelMySubscription")
            .WithSummary("Cancel the tenant's subscription.")
            .Produces<ResponseMessage<TenantSubscriptionDetailViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Subscription.OwnManage);

            group.MapGet("/invoices/{id:guid}/download", async (Guid id, IUser user, IMediatorHandler bus) =>
            {
                TenantSubscriptionDetailViewModel? detail = await bus.QueryAsync(new GetTenantSubscriptionQuery(user.GetTenantId()));
                SubscriptionInvoiceViewModel? invoice = detail?.Invoices.FirstOrDefault(i => i.Id == id);
                if (detail == null || invoice == null) return Results.NotFound();

                return Results.File(BuildInvoiceHtml(detail, invoice), "text/html", $"{invoice.InvoiceNumber}.html");
            })
            .WithName("DownloadMyInvoice")
            .WithSummary("A printable HTML copy of one of the tenant's invoices.")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Subscription.OwnRead);
        }

        private static byte[] BuildInvoiceHtml(TenantSubscriptionDetailViewModel tenant, SubscriptionInvoiceViewModel invoice)
        {
            static string E(string? value) => System.Net.WebUtility.HtmlEncode(value ?? string.Empty);
            string amount = $"{invoice.Amount.ToString("N2", System.Globalization.CultureInfo.InvariantCulture)} {E(invoice.Currency)}";

            string html = $$"""
                <!doctype html>
                <html lang="en"><head><meta charset="utf-8"><title>{{E(invoice.InvoiceNumber)}}</title>
                <style>
                  body { font-family: system-ui, sans-serif; color: #1f2937; max-width: 720px; margin: 40px auto; padding: 0 16px; }
                  h1 { font-size: 22px; margin: 0 0 4px; } .muted { color: #6b7280; font-size: 13px; }
                  table { width: 100%; border-collapse: collapse; margin-top: 24px; } td, th { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; text-align: left; }
                  .total { font-weight: 600; font-size: 16px; } .status { display: inline-block; padding: 2px 8px; border-radius: 4px; background: #f3f4f6; font-size: 12px; }
                </style></head><body>
                <h1>Invoice {{E(invoice.InvoiceNumber)}}</h1>
                <div class="muted">Issued {{invoice.IssuedAt:yyyy-MM-dd}} · Due {{invoice.DueDate:yyyy-MM-dd}} · <span class="status">{{E(invoice.Status)}}</span></div>
                <p><strong>Billed to</strong><br>{{E(tenant.TenantName)}}<br>{{E(tenant.BillingEmail)}}</p>
                <table>
                  <tr><th>Description</th><th>Period</th><th style="text-align:right">Amount</th></tr>
                  <tr><td>{{E(invoice.PlanName)}} plan</td><td>{{invoice.PeriodStart:yyyy-MM-dd}} – {{invoice.PeriodEnd:yyyy-MM-dd}}</td><td style="text-align:right">{{amount}}</td></tr>
                  <tr><td colspan="2" class="total">Total</td><td style="text-align:right" class="total">{{amount}}</td></tr>
                </table>
                {{(invoice.PaidAt.HasValue ? $"<p class=\"muted\">Paid {invoice.PaidAt:yyyy-MM-dd}{(string.IsNullOrEmpty(invoice.PaymentReference) ? "" : " · ref " + E(invoice.PaymentReference))}</p>" : "<p class=\"muted\">Please pay by bank transfer and quote the invoice number.</p>")}}
                </body></html>
                """;

            return System.Text.Encoding.UTF8.GetBytes(html);
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
