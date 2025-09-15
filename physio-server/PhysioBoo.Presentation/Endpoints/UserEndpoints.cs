using PhysioBoo.Application.Commands.Users.CreateUser;
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class UserEndpoints
    {
        public static void MapUserEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/users")
                .WithTags("Users")
                .WithOpenApi();

            // Create user
            group.MapPost("/", async (
                CreateUserViewModel newUser,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateUserCommand(new List<CreateUserViewModel>
                {
                    newUser
                }));

                return newUser.Id;
            }).WithName("CreateUser")
            .WithSummary("Create new user")
            .Produces<ResponseMessage<List<Guid>>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<List<Guid>>>(StatusCodes.Status400BadRequest);
        }
    }
}
