using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class DevEndpoints
    {
        public static void MapDevEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api")
                .WithTags("Cookies")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Check
            // Get cookies
            group.MapGet("/check", (
                HttpRequest request,
                CancellationToken cancellationToken
            ) =>
            {
                return Results.Ok(new ResponseMessage<string>
                {
                    Success = true,
                    Data = "Application started successfully!"
                });
            }).WithName("Check")
            .WithSummary("Check Application Is Running")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Get cookies
            group.MapGet("/cookies", (
                HttpRequest request,
                CancellationToken cancellationToken
            ) =>
            {
                IRequestCookieCollection cookies = request.Cookies;
                return Results.Ok(new ResponseMessage<IRequestCookieCollection>
                {
                    Success = true,
                    Data = cookies
                });
            }).WithName("GetCookies")
            .WithSummary("Get all cookies from request")
            .Produces<ResponseMessage<IRequestCookieCollection>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<IRequestCookieCollection>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Check is authenticated
            group.MapGet("/is-authenticated", (
                HttpContext context,
                CancellationToken cancellationToken
            ) =>
            {
                bool? isAuthenticated = context.User.Identity?.IsAuthenticated;

                return Results.Ok(new ResponseMessage<string>
                {
                    Success = true,
                    Data = $"Status: {isAuthenticated}"
                });
            }).WithName("Check Is Authenticated")
            .WithSummary("Check user is authenticated or not")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest);
            #endregion 

            #region Send mail
            // Get cookies
            group.MapPost("/test-mail", async (
                HttpRequest request,
                [FromBody] string To,
                IEmailSender emailSender,
                CancellationToken cancellationToken
            ) =>
            {
                await emailSender.SendTemplateAsync(To, "Email", new { UserName = "test", VerificationUrl = "test" }, "Test mail");

                return Results.Ok(new ResponseMessage<string>
                {
                    Success = true,
                    Data = "Mail was sent successfully!"
                });
            }).WithName("Send maill")
            .WithSummary("Send mail")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest);
            #endregion
        }
    }
}
