using MediatR;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.SharedKenel.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PhysioBoo.Application.Commands.Users.GenerateEmailVerificationToken
{
    public sealed class GenerateEmailVerificationTokenCommandHandler : CommandHandlerBase, IRequestHandler<GenerateEmailVerificationTokenCommand>
    {
        public GenerateEmailVerificationTokenCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications
        ) : base( bus, unitOfWork, notifications )
        {
            
        }

        public async Task Handle(GenerateEmailVerificationTokenCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var newToken = TokenHelper.GenerateTimestampedToken(24);


        }
    }
}
