using MediatR;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands
{
    public abstract class CommandHandlerBase
    {
        private readonly DomainNotificationHandler _notifications;
        private readonly IUnitOfWork _unitOfWork;
        protected readonly IMediatorHandler Bus;

        protected CommandHandlerBase(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications)
        {
            Bus = bus;
            _unitOfWork = unitOfWork;
            _notifications = (DomainNotificationHandler)notifications;
        }

        protected async Task<bool> CommitAsync()
        {
            if (_notifications.HasNotifications())
            {
                return false;
            }

            try
            {
                return await _unitOfWork.CommitAsync();
            }
            catch (DbUpdateException ex) when (ex.InnerException is PostgresException pgEx)
            {
                var parts = pgEx.ConstraintName?.Split('_');
                var lastPart = parts?.LastOrDefault();

                string field = lastPart ?? "Unknown";
                string code = $"DUPLICATE_{field.ToUpper()}";
                string message = $"{field} already exists.";

                await Bus.RaiseEventAsync(new DomainNotification(
                    "Commit",
                    message,
                    code,
                    new { pgEx.ConstraintName }));

                return false;
            }
            catch (Exception)
            {
                await Bus.RaiseEventAsync(new DomainNotification(
                    "Commit",
                    "Unexpected error while saving the data.",
                    ErrorCodes.CommitFailed)
                );

                return false;
            }
        }

        protected async Task NotifyAsync(string key, string message, string code)
        {
            await Bus.RaiseEventAsync(
                new DomainNotification(key, message, code));
        }

        protected async Task NotifyAsync(DomainNotification notification)
        {
            await Bus.RaiseEventAsync(notification);
        }

        protected async ValueTask<bool> TestValidityAsync(CommandBase command)
        {
            if (command.IsValid())
            {
                return true;
            }

            if (command.ValidationResult is null)
            {
                throw new InvalidOperationException("Command is invalid and should therefore have a validation result");
            }

            foreach (var error in command.ValidationResult!.Errors)
            {
                await NotifyAsync(
                    new DomainNotification(
                        command.MessageType,
                        error.ErrorMessage,
                        error.ErrorCode,
                        error.FormattedMessagePlaceholderValues));
            }

            return false;
        }
    }
}
