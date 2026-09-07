using Microsoft.Extensions.Options;
using PhysioBoo.Application.Commands.Payments.CreatePayment;
using PhysioBoo.Application.Commands.Transactions.HandleGatewayNotification;
using PhysioBoo.Application.Commands.Transactions.InitiatePayment;
using PhysioBoo.Application.Queries.Transactions.GetStatus;
using PhysioBoo.Application.ViewModels.Payments;
using PhysioBoo.Application.ViewModels.Transactions;


using PhysioBoo.Domain.Settings;



namespace PhysioBoo.Presentation.Endpoints
{
    public static class PaymentEndpoints
    {
        public static void MapPaymentEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/payments")
                .WithTags("Payments")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Create payment
            group.MapPost("/create", async (
                CreatePaymentViewModel newPayment,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new CreatePaymentCommand(newPayment));

                return Results.Created($"/api/payments/{newPayment.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newPayment.Id
                });
            }).WithName("CreatePayment")
            .WithSummary("Create new payment")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Billing.PaymentCreate);
            #endregion

            #region Initiate a gateway payment session (creates a Transaction, calls the gateway)
            group.MapPost("/initiate", async (
                InitiatePaymentViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                InitiatePaymentCommand command = new InitiatePaymentCommand(request);

                await bus.SendCommandAsync(command);

                if (command.Result is null)
                {
                    return Results.BadRequest();
                }

                return Results.Created($"/api/payments/{command.Result.Id}/status", new ResponseMessage<TransactionViewModel>
                {
                    Success = true,
                    Data = command.Result
                });
            }).WithName("InitiatePayment")
            .WithSummary("Initiate a gateway payment session")
            .Produces<ResponseMessage<TransactionViewModel>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<TransactionViewModel>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Billing.PaymentCreate);
            #endregion

            #region Query / refresh a transaction's status
            group.MapGet("/{id:guid}/status", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                TransactionViewModel? result = await bus.QueryAsync(new GetTransactionStatusQuery(id));

                return Results.Ok(new ResponseMessage<TransactionViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetTransactionStatus")
            .WithSummary("Get the current status of a payment transaction")
            .Produces<ResponseMessage<TransactionViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<TransactionViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Billing.PaymentRead);
            #endregion

            #region Server-to-server notification from the payment provider (IPN / webhook)
            group.MapPost("/notify/{gateway}", async (
                string gateway,
                HttpRequest httpRequest,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                string rawBody = await ReadBodyAsync(httpRequest);

                GatewayNotificationContext context = new GatewayNotificationContext
                {
                    RawBody = rawBody,
                    Headers = httpRequest.Headers.ToDictionary(h => h.Key, h => h.Value.ToString()),
                    QueryParams = httpRequest.Query.ToDictionary(q => q.Key, q => q.Value.ToString()),
                };

                // Always acknowledge with 200 so the provider does not retry indefinitely —
                // failures are recorded as DomainNotifications, not surfaced to the caller.
                await bus.SendCommandAsync(new HandleGatewayNotificationCommand(gateway, context));

                return Results.Ok();
            }).WithName("HandlePaymentGatewayNotification")
            .WithSummary("Receive a payment gateway IPN/webhook notification")
            .ExcludeFromDescription();
            #endregion

            #region Browser redirect after the user completes or cancels payment
            group.MapGet("/callback/{gateway}", async (
                string gateway,
                HttpRequest httpRequest,
                IMediatorHandler bus,
                IOptions<ClientSettings> clientSettings,
                CancellationToken ct
            ) =>
            {
                GatewayNotificationContext context = new GatewayNotificationContext
                {
                    RawBody = string.Empty,
                    QueryParams = httpRequest.Query.ToDictionary(q => q.Key, q => q.Value.ToString()),
                };

                await bus.SendCommandAsync(new HandleGatewayNotificationCommand(gateway, context));

                bool success = httpRequest.Query.TryGetValue("resultCd", out Microsoft.Extensions.Primitives.StringValues code)
                    && code == "00_000";

                return Results.Redirect(success
                    ? $"{clientSettings.Value.BaseUrl}/payments/success"
                    : $"{clientSettings.Value.BaseUrl}/payments/result?resultCd={code}");
            }).WithName("PaymentGatewayCallback")
            .WithSummary("Browser redirect target after a payment attempt completes")
            .ExcludeFromDescription();
            #endregion
        }

        private static async Task<string> ReadBodyAsync(HttpRequest request)
        {
            request.EnableBuffering();
            using StreamReader reader = new StreamReader(request.Body, leaveOpen: true);
            string body = await reader.ReadToEndAsync();
            request.Body.Position = 0;
            return body;
        }
    }
}
