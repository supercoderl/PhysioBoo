using MassTransit;
using Microsoft.Extensions.Logging;
using PhysioBoo.Application.Commands.Doctors.CreateDoctor;
using PhysioBoo.Application.Commands.Patients.CreatePatient;
using PhysioBoo.Application.Commands.Users.GenerateEmailVerificationToken;
using PhysioBoo.Application.ViewModels.Doctors;
using PhysioBoo.Application.ViewModels.Patients;
using PhysioBoo.Application.ViewModels.VerificationTokens;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Shared.Events.Users;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Consumers.Users
{
    public sealed class UserCreatedEventConsumer : IConsumer<UsersCreatedEvent>
    {
        private readonly ILogger<UserCreatedEventConsumer> _logger;
        private readonly IMediatorHandler _bus;

        public UserCreatedEventConsumer(ILogger<UserCreatedEventConsumer> logger, IMediatorHandler bus)
        {
            _logger = logger;
            _bus = bus;
        }

        public async Task Consume(ConsumeContext<UsersCreatedEvent> context)
        {
            _logger.LogInformation(
                    "UserCreatedEventConsumer handled for User {UserId}, CorrelationId {CorrelationId}",
                    context.Message.AggregateId, context.CorrelationId
                );

            List<Task> tasks = new List<Task>
            {
                 _bus.SendCommandAsync(new GenerateEmailVerificationTokenCommand(
                    new CreateVerificationTokenViewModel(
                        Guid.NewGuid(),
                        context.Message.AggregateId,
                        TokenHelper.GenerateTimestampedToken(24),
                        TimeZoneHelper.GetLocalTimeNow().AddMinutes(15),
                        Enum.Parse<VerificationType>(context.Message.Type)
                )
                ))
            };

            if (Enum.TryParse<Role>(context.Message.Role, ignoreCase: true, out Role role)
                && Enum.IsDefined(typeof(Role), role))
            {
                switch (role)
                {
                    case Role.Patient:
                        tasks.Add(_bus.SendCommandAsync(new CreatePatientCommand(
                            Guid.NewGuid(),
                            new CreatePatientViewModel(
                                context.Message.AggregateId,
                                Guid.NewGuid(),
                                null, null, null, null, null, null,
                                null, null, null, null, null, null,
                                null, null, null, null, null, null
                            )
                        )));
                        break;
                    case Role.Doctor:
                        tasks.Add(_bus.SendCommandAsync(new CreateDoctorCommand(
                            context.Message.AggregateId,
                            new CreateDoctorViewModel(
                                string.Empty,
                                DateOnly.MinValue,
                                null, null, null, null, null, null,
                                null, null, null, null, null, null,
                                null
                            )
                        )));
                        break;
                }
            }

            await Task.WhenAll(tasks);
        }
    }
}
