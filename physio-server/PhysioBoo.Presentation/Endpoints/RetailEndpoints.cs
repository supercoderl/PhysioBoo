using PhysioBoo.Application.Commands.RetailCarts.AttachCustomer;
using PhysioBoo.Application.Commands.RetailCarts.CheckoutCart;
using PhysioBoo.Application.Commands.RetailCarts.CreateCart;
using PhysioBoo.Application.Commands.RetailCarts.EmailReceipt;
using PhysioBoo.Application.Commands.RetailCarts.RefundTransaction;
using PhysioBoo.Application.Commands.RetailCarts.RemoveCartItem;
using PhysioBoo.Application.Commands.RetailCarts.ResumeCart;
using PhysioBoo.Application.Commands.RetailCarts.SmsReceipt;
using PhysioBoo.Application.Commands.RetailCarts.SuspendCart;
using PhysioBoo.Application.Commands.RetailCarts.UpsertCartItem;
using PhysioBoo.Application.Queries.RetailCarts.CheckCartWarnings;
using PhysioBoo.Application.Queries.RetailCarts.GetCartById;
using PhysioBoo.Application.Queries.RetailCarts.GetCarts;
using PhysioBoo.Application.Queries.RetailCarts.GetInsight;
using PhysioBoo.Application.Queries.RetailCarts.GetMedicineDetail;
using PhysioBoo.Application.Queries.RetailCarts.GetSuggestions;
using PhysioBoo.Application.Queries.RetailCarts.GetTransactionById;
using PhysioBoo.Application.Queries.RetailCarts.LookupByBarcode;
using PhysioBoo.Application.Queries.RetailCarts.SearchCatalog;
using PhysioBoo.Application.Queries.RetailCarts.SearchPatients;
using PhysioBoo.Application.ViewModels.Retail;






namespace PhysioBoo.Presentation.Endpoints
{
    public static class RetailEndpoints
    {
        public static void MapRetailEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/pharmacy/retail")
                .WithTags("Pharmacy Retail")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // 1. Search catalog
            group.MapGet("/catalog/search", async (
                string? search,
                int pageNumber,
                int pageSize,
                Guid? categoryId,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedRequest<RetailCatalogFilter> request = new PagedRequest<RetailCatalogFilter>
                {
                    Search = search,
                    PageNumber = pageNumber <= 0 ? 1 : pageNumber,
                    PageSize = pageSize <= 0 ? 20 : pageSize,
                    Filter = new RetailCatalogFilter { CategoryId = categoryId }
                };

                PagedResult<RetailMedicineCardViewModel> result = await bus.QueryAsync(new SearchCatalogQuery(request));
                return Results.Ok(new ResponseMessage<PagedResult<RetailMedicineCardViewModel>> { Success = true, Data = result });
            }).WithName("SearchRetailCatalog")
            .Produces<ResponseMessage<PagedResult<RetailMedicineCardViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.MedicineInventoryRead);

            // 2. Lookup by barcode
            group.MapGet("/catalog/barcode/{code}", async (
                string code,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                RetailMedicineCardViewModel? result = await bus.QueryAsync(new LookupByBarcodeQuery(code));
                return Results.Ok(new ResponseMessage<RetailMedicineCardViewModel?> { Success = true, Data = result });
            }).WithName("LookupRetailMedicineByBarcode")
            .Produces<ResponseMessage<RetailMedicineCardViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.MedicineInventoryRead);

            // 3. Medicine detail
            group.MapGet("/catalog/{medicineId:guid}", async (
                Guid medicineId,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                RetailMedicineDetailViewModel? result = await bus.QueryAsync(new GetMedicineDetailQuery(medicineId));
                return Results.Ok(new ResponseMessage<RetailMedicineDetailViewModel?> { Success = true, Data = result });
            }).WithName("GetRetailMedicineDetail")
            .Produces<ResponseMessage<RetailMedicineDetailViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.MedicineInventoryRead);

            // 4. Suggestions
            group.MapGet("/catalog/suggestions", async (
                string mode,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                List<RetailMedicineCardViewModel> result = await bus.QueryAsync(new GetSuggestionsQuery(mode));
                return Results.Ok(new ResponseMessage<List<RetailMedicineCardViewModel>> { Success = true, Data = result });
            }).WithName("GetRetailCatalogSuggestions")
            .Produces<ResponseMessage<List<RetailMedicineCardViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.MedicineInventoryRead);

            // 5. Inventory insight
            group.MapGet("/insight", async (
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                RetailInventoryInsightViewModel result = await bus.QueryAsync(new GetInsightQuery());
                return Results.Ok(new ResponseMessage<RetailInventoryInsightViewModel> { Success = true, Data = result });
            }).WithName("GetRetailInventoryInsight")
            .Produces<ResponseMessage<RetailInventoryInsightViewModel>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.MedicineInventoryRead);

            // 6. List carts
            group.MapGet("/carts", async (
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                List<RetailCartViewModel> result = await bus.QueryAsync(new GetCartsQuery());
                return Results.Ok(new ResponseMessage<List<RetailCartViewModel>> { Success = true, Data = result });
            }).WithName("GetRetailCarts")
            .Produces<ResponseMessage<List<RetailCartViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.RetailCartRead);

            // 7. Create cart
            group.MapPost("/carts", async (
                CreateCartRequestBody body,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                CreateCartViewModel newCart = new CreateCartViewModel(Guid.NewGuid(), body.HospitalId, body.Name);
                await bus.SendCommandAsync(new CreateCartCommand(newCart));

                RetailCartViewModel? result = await bus.QueryAsync(new GetCartByIdQuery(newCart.Id));
                return Results.Created($"/api/pharmacy/retail/carts/{newCart.Id}", new ResponseMessage<RetailCartViewModel?> { Success = true, Data = result });
            }).WithName("CreateRetailCart")
            .Produces<ResponseMessage<RetailCartViewModel?>>(StatusCodes.Status201Created)
            .RequireAuthorization(Permissions.Pharmacy.RetailCartCreate);

            // 8. Upsert cart line item
            group.MapPut("/carts/{cartId:guid}/items/{medicineId:guid}", async (
                Guid cartId,
                Guid medicineId,
                UpsertCartItemViewModel body,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpsertCartItemCommand(cartId, medicineId, body));
                RetailCartViewModel? result = await bus.QueryAsync(new GetCartByIdQuery(cartId));
                return Results.Ok(new ResponseMessage<RetailCartViewModel?> { Success = true, Data = result });
            }).WithName("UpsertRetailCartItem")
            .Produces<ResponseMessage<RetailCartViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.RetailCartUpdate);

            // 9. Remove cart line item
            group.MapDelete("/carts/{cartId:guid}/items/{lineItemId:guid}", async (
                Guid cartId,
                Guid lineItemId,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new RemoveCartItemCommand(cartId, lineItemId));
                RetailCartViewModel? result = await bus.QueryAsync(new GetCartByIdQuery(cartId));
                return Results.Ok(new ResponseMessage<RetailCartViewModel?> { Success = true, Data = result });
            }).WithName("RemoveRetailCartItem")
            .Produces<ResponseMessage<RetailCartViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.RetailCartUpdate);

            // 10. Attach customer
            group.MapPatch("/carts/{cartId:guid}/customer", async (
                Guid cartId,
                AttachCustomerViewModel body,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new AttachCustomerCommand(cartId, body));
                RetailCartViewModel? result = await bus.QueryAsync(new GetCartByIdQuery(cartId));
                return Results.Ok(new ResponseMessage<RetailCartViewModel?> { Success = true, Data = result });
            }).WithName("AttachRetailCartCustomer")
            .Produces<ResponseMessage<RetailCartViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.RetailCartUpdate);

            // 11. Suspend cart
            group.MapPost("/carts/{cartId:guid}/suspend", async (
                Guid cartId,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new SuspendCartCommand(cartId));
                RetailCartViewModel? result = await bus.QueryAsync(new GetCartByIdQuery(cartId));
                return Results.Ok(new ResponseMessage<RetailCartViewModel?> { Success = true, Data = result });
            }).WithName("SuspendRetailCart")
            .Produces<ResponseMessage<RetailCartViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.RetailCartUpdate);

            // 12. Resume cart
            group.MapPost("/carts/{cartId:guid}/resume", async (
                Guid cartId,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new ResumeCartCommand(cartId));
                RetailCartViewModel? result = await bus.QueryAsync(new GetCartByIdQuery(cartId));
                return Results.Ok(new ResponseMessage<RetailCartViewModel?> { Success = true, Data = result });
            }).WithName("ResumeRetailCart")
            .Produces<ResponseMessage<RetailCartViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.RetailCartUpdate);

            // 13. Search patients
            group.MapGet("/patients/search", async (
                string query,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                List<RetailCustomerViewModel> result = await bus.QueryAsync(new SearchPatientsQuery(query));
                return Results.Ok(new ResponseMessage<List<RetailCustomerViewModel>> { Success = true, Data = result });
            }).WithName("SearchRetailPatients")
            .Produces<ResponseMessage<List<RetailCustomerViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.RetailCartRead);

            // 14. Check clinical/interaction warnings
            group.MapPost("/cart/{cartId:guid}/warnings", async (
                Guid cartId,
                CheckCartWarningsRequestBody body,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                List<string> result = await bus.QueryAsync(new CheckCartWarningsQuery(body.PatientId, body.MedicineIds));
                return Results.Ok(new ResponseMessage<List<string>> { Success = true, Data = result });
            }).WithName("CheckRetailCartWarnings")
            .Produces<ResponseMessage<List<string>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.RetailCartRead);

            // 15. Checkout
            group.MapPost("/carts/{cartId:guid}/checkout", async (
                Guid cartId,
                CheckoutRequestBody body,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                CheckoutCartViewModel checkout = new CheckoutCartViewModel(
                    Guid.NewGuid(),
                    body.HospitalId,
                    body.PaymentSplits,
                    body.AmountTendered
                );

                await bus.SendCommandAsync(new CheckoutCartCommand(cartId, checkout));
                RetailTransactionViewModel? result = await bus.QueryAsync(new GetTransactionByIdQuery(checkout.TransactionId));
                return Results.Ok(new ResponseMessage<RetailTransactionViewModel?> { Success = true, Data = result });
            }).WithName("CheckoutRetailCart")
            .Produces<ResponseMessage<RetailTransactionViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.RetailTransactionCreate);

            // 16. Refund
            group.MapPost("/transactions/{transactionId:guid}/refund", async (
                Guid transactionId,
                RefundTransactionViewModel body,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new RefundTransactionCommand(transactionId, body));
                RetailTransactionViewModel? result = await bus.QueryAsync(new GetTransactionByIdQuery(transactionId));
                return Results.Ok(new ResponseMessage<RetailTransactionViewModel?> { Success = true, Data = result });
            }).WithName("RefundRetailTransaction")
            .Produces<ResponseMessage<RetailTransactionViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.RetailTransactionRefund);

            // 17. Get transaction
            group.MapGet("/transactions/{transactionId:guid}", async (
                Guid transactionId,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                RetailTransactionViewModel? result = await bus.QueryAsync(new GetTransactionByIdQuery(transactionId));
                return Results.Ok(new ResponseMessage<RetailTransactionViewModel?> { Success = true, Data = result });
            }).WithName("GetRetailTransaction")
            .Produces<ResponseMessage<RetailTransactionViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.RetailTransactionRead);

            // 18. Receipt (JSON representation for this pass — no PDF renderer wired to Retail yet;
            // reuse the app's existing PrintTemplate infrastructure for real PDF output later).
            group.MapGet("/transactions/{transactionId:guid}/receipt", async (
                Guid transactionId,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                RetailTransactionViewModel? result = await bus.QueryAsync(new GetTransactionByIdQuery(transactionId));
                return Results.Ok(new ResponseMessage<RetailTransactionViewModel?> { Success = true, Data = result });
            }).WithName("GetRetailReceipt")
            .Produces<ResponseMessage<RetailTransactionViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.RetailTransactionRead);

            // 19. Email receipt
            group.MapPost("/transactions/{transactionId:guid}/receipt/email", async (
                Guid transactionId,
                EmailReceiptViewModel body,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new EmailReceiptCommand(transactionId, body));
                return Results.Ok(new ResponseMessage<string> { Success = true, Data = "queued" });
            }).WithName("EmailRetailReceipt")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.RetailTransactionRead);

            // 20. SMS receipt
            group.MapPost("/transactions/{transactionId:guid}/receipt/sms", async (
                Guid transactionId,
                SmsReceiptViewModel body,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new SmsReceiptCommand(transactionId, body));
                return Results.Ok(new ResponseMessage<string> { Success = true, Data = "queued" });
            }).WithName("SmsRetailReceipt")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.RetailTransactionRead);
        }

        public sealed record CreateCartRequestBody(Guid HospitalId, string? Name);
        public sealed record CheckoutRequestBody(Guid HospitalId, List<CheckoutPaymentSplitInput> PaymentSplits, decimal AmountTendered);
        public sealed record CheckCartWarningsRequestBody(Guid? PatientId, List<Guid> MedicineIds);
    }
}
