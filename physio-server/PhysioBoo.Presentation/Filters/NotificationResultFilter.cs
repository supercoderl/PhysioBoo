using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;
using System.Net;

namespace PhysioBoo.Presentation.Filters
{
    public sealed class NotificationResultFilter : IEndpointFilter
    {
        private readonly INotificationHandler<DomainNotification> _handler;

        public NotificationResultFilter(INotificationHandler<DomainNotification> handler)
        {
            _handler = handler;
        }

        public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
        {
            object? result = await next(context);
            DomainNotificationHandler notifications = (DomainNotificationHandler)_handler;
            if (notifications.HasNotifications())
            {
                List<DomainNotification> notis = notifications.GetNotifications();
                int statusCode = (int)HttpStatusCode.BadRequest;
                if (notis.Any(n => n.Code == ErrorCodes.ObjectNotFound))
                {
                    statusCode = (int)HttpStatusCode.NotFound;
                }
                else if (notis.Any(n => n.Code == ErrorCodes.InsufficientPermissions))
                {
                    statusCode = (int)HttpStatusCode.Forbidden;
                }

                return Results.Json(new ResponseMessage<object>
                {
                    Success = false,
                    Errors = notis.Select(n => n.Value),
                    DetailedErrors = notis.Select(n => new DetailedError
                    {
                        Code = n.Code,
                        Data = n.Data
                    })
                }, statusCode: statusCode);
            }

            return result;
        }
    }
}
