namespace PhysioBoo.Presentation.Extensions
{
    public static class HttpContextExtensions
    {
        public static string GetClientIpAddress(this HttpContext context)
        {
            string? forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedFor))
            {
                return forwardedFor.Split(',').First().Trim();
            }

            return context.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0";
        }
    }
}
