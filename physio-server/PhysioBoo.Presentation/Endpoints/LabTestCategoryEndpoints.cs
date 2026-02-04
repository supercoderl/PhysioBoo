using PhysioBoo.Application.Commands.LabTestCategories.CreateLabTestCategory;
using PhysioBoo.Application.ViewModels.LabTestCategories;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class LabTestCategoryEndpoints
    {
        public static void MapLabTestCategoryEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/lab-test-categories")
                .WithTags("Lab Test Category")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create lab test category
            group.MapPost("/create", async (
                CreateLabTestCategoryViewModel newLabTestCategory,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateLabTestCategoryCommand(newLabTestCategory));

                return Results.Created($"/api/lab-test-categories/{newLabTestCategory.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newLabTestCategory.Id
                });
            }).WithName("CreateLabTestCategory")
            .WithSummary("Create new lab test category")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
