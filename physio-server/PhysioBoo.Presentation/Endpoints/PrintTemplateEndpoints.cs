using PhysioBoo.Application.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class PrintTemplateEndpoints
    {
        public static void MapPrintTemplateEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/print-templates")
                .WithTags("PrintTemplates")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Get dictionary of available tags for a given template type (e.g., Patient, Doctor)
            group.MapPost("/dictionary/{documentType}", (
                string documentType,
                ITemplateDictionaryService dictionaryService,
                CancellationToken cancellationToken
            ) =>
            {
                object? dictionaryResult = null;

                switch (documentType.ToLower())
                {
                    case "prescription":
                    case "clinical":
                        //dictionaryResult = dictionaryService.GenerateDictionary(typeof());
                        break;
                    default:
                        return Results.BadRequest($"Unknown document type: {documentType}");
                }

                return Results.Ok(new ResponseMessage<object?>
                {
                    Success = true,
                    Data = dictionaryResult
                });
            }).WithName("GetDictionary")
            .WithSummary("Get dictionary of available tags for a given template type")
            .Produces<ResponseMessage<object?>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<object?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
        }
    }
}
