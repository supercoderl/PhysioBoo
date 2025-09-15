﻿using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;
using System.Net;

namespace PhysioBoo.Presentation.Helpers
{
    public class ApiResponseHelper
    {
        private readonly DomainNotificationHandler _notifications;

        public ApiResponseHelper(INotificationHandler<DomainNotification> notifications)
        {
            _notifications = (DomainNotificationHandler)notifications;
        }

        public IResult Response(object? resultData = null)
        {
            if (!_notifications.HasNotifications())
            {
                return Results.Ok(new ResponseMessage<object>
                {
                    Success = true,
                    Data = resultData
                });
            }

            var message = new ResponseMessage<object>
            {
                Success = false,
                Errors = _notifications.GetNotifications().Select(n => n.Value),
                DetailedErrors = _notifications.GetNotifications().Select(n => new DetailedError
                {
                    Code = n.Code,
                    Data = n.Data
                })
            };

            return Results.Json(message, statusCode: (int)GetErrorStatusCode());
        }

        public HttpStatusCode GetStatusCode()
        {
            if (!_notifications.GetNotifications().Any())
            {
                return HttpStatusCode.OK;
            }

            return GetErrorStatusCode();
        }

        private HttpStatusCode GetErrorStatusCode()
        {
            if (_notifications.GetNotifications().Any(n => n.Code == ErrorCodes.ObjectNotFound))
            {
                return HttpStatusCode.NotFound;
            }

            if (_notifications.GetNotifications().Any(n => n.Code == ErrorCodes.InsufficientPermissions))
            {
                return HttpStatusCode.Forbidden;
            }

            return HttpStatusCode.BadRequest;
        }
    }

}
