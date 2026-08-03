using PhysioBoo.Domain.Exceptions;

namespace PhysioBoo.Presentation.Middlewares
{
    public sealed class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (UnauthenticatedException ex)
            {
                _logger.LogWarning(ex, "Unauthenticated request to {Path}", context.Request.Path);
                await WriteResponseAsync(context, StatusCodes.Status401Unauthorized, ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception processing {Path}", context.Request.Path);
                await WriteResponseAsync(context, StatusCodes.Status500InternalServerError, "An unexpected error occurred.");
            }
        }

        private static Task WriteResponseAsync(HttpContext context, int statusCode, string message)
        {
            if (context.Response.HasStarted)
            {
                return Task.CompletedTask;
            }

            context.Response.StatusCode = statusCode;
            return context.Response.WriteAsJsonAsync(new { success = false, message });
        }
    }
}
