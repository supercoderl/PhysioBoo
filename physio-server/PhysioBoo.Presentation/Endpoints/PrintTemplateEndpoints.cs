using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.PrintTemplates.CreatePrintTemplate;
using PhysioBoo.Application.Commands.PrintTemplates.DeletePrintTemplate;
using PhysioBoo.Application.Commands.PrintTemplates.SaveVersionPrintTemplate;
using PhysioBoo.Application.Commands.PrintTemplates.UpdatePrintTemplate;
using PhysioBoo.Application.Interfaces;
using PhysioBoo.Application.Queries.PrintTemplates.GetAll;
using PhysioBoo.Application.Queries.PrintTemplates.GetByCode;
using PhysioBoo.Application.Queries.PrintTemplates.GetById;
using PhysioBoo.Application.Queries.PrintTemplates.Render;
using PhysioBoo.Application.ViewModels.PrintTemplates;
using PhysioBoo.Application.ViewModels.PrintTemplateVersions;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;
using PhysioBoo.SharedKernel.Common;

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
            group.MapGet("/placeholders", (
                [FromQuery] string? module,
                ITemplateDictionaryService dictionaryService,
                CancellationToken cancellationToken
            ) =>
            {
                IReadOnlyList<PlaceholderGroupViewModel> groups = dictionaryService.GetPlaceholderGroups(module);

                return Results.Ok(new ResponseMessage<object?>
                {
                    Success = true,
                    Data = groups
                });
            }).WithName("GetDictionary")
            .WithSummary("List placeholders available to print templates")
            .Produces<ResponseMessage<object?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<object?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();

            #region Get All Print Templates
            group.MapPost("search", async (
                [FromBody] PagedRequest<PrintTemplateFilter> request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                PagedResult<PrintTemplateViewModel> result = await bus.QueryAsync(new GetAllPrintTemplatesQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<PrintTemplateViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetPrintTemplates")
            .WithSummary("Retrieve a paginated list of print templates with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<PrintTemplateViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<PrintTemplateViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Get Print Template By Id
            group.MapGet("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                PrintTemplateViewModel? result = await bus.QueryAsync(new GetPrintTemplateByIdQuery(id));

                return Results.Ok(new ResponseMessage<PrintTemplateViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetPrintTemplateById")
            .WithSummary("Retrieve a print template record.")
            .Produces<ResponseMessage<PrintTemplateViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PrintTemplateViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Get Print Template By Code
            group.MapGet("{code}", async (
                string code,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                PrintTemplateViewModel? result = await bus.QueryAsync(new GetPrintTemplateByCodeQuery(code));

                return Results.Ok(new ResponseMessage<PrintTemplateViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetPrintTemplateByCode")
            .WithSummary("Retrieve a print template record.")
            .Produces<ResponseMessage<PrintTemplateViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PrintTemplateViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Create New Print Template
            group.MapPost("", async (
                [FromBody] CreatePrintTemplateViewModel request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                Guid newId = Guid.NewGuid();
                await bus.SendCommandAsync(new CreatePrintTemplateCommand(newId, request));

                return Results.CreatedAtRoute(
                    "GetPrintTemplateById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newId
                    }
                );
            }).WithName("CreatePrintTemplate")
            .WithSummary("Create new print template")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Render Print Template
            group.MapPost("render", async (
                [FromBody] RenderPrintTemplateViewModel request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                PrintTemplateRender? result = await bus.QueryAsync(new RenderPrintTemplateQuery(request.TemplateCode, request.TemplateId, request.Data));

                return Results.Ok(new ResponseMessage<PrintTemplateRender>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("RenderPrintTemplate")
            .WithSummary("Render print template")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Delete Print Template
            group.MapDelete("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new DeletePrintTemplateCommand(id));

                return Results.NoContent();
            }).WithName("DeletePrintTemplate")
            .WithSummary("Handles requests to delete a specific print template by its identifier.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Update Print Template
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] UpdatePrintTemplateViewModel request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new UpdatePrintTemplateCommand(id, request));

                return Results.NoContent();
            }).WithName("UpdatePrintTemplate")
            .WithSummary("Update print template")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .RequireAuthorization();
            #endregion

            #region Save Version Print Template
            group.MapPost("{id:guid}/versions", async (
                Guid id,
                [FromBody] UpdatePrintTemplateVersionViewModel request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new SaveVersionPrintTemplateCommand(id, request));

                return Results.NoContent();
            }).WithName("SaveVersionPrintTemplate")
            .WithSummary("Save version print template")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .RequireAuthorization();
            #endregion
        }
    }
}
