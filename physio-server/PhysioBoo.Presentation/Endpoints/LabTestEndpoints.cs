using PhysioBoo.Application.Commands.LabTests.CreateLabTest;
using PhysioBoo.Application.ViewModels.LabTests;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class LabTestEndpoints
    {
        public static void MapLabTestEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/lab-tests")
                .WithTags("Lab Tests")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create lab test
            group.MapPost("/create", async (
                CreateLabTestViewModel newLabTest,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateLabTestCommand(newLabTest));

                return Results.Created($"/api/lab-tests/{newLabTest.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newLabTest.Id
                });
            }).WithName("CreateLabTest")
            .WithSummary("Create new lab test")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
