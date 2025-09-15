using MediatR;
using PhysioBoo.Shared.Events;
using PhysioBoo.SharedKenel.Commands;

namespace PhysioBoo.Domain.Interfaces
{
    public interface IMediatorHandler
    {
        Task RaiseEventAsync<T>(T @event) where T : DomainEvent;

        Task SendCommandAsync<T>(T command) where T : CommandBase;

        Task<TResponse> QueryAsync<TResponse>(IRequest<TResponse> query);
    }
}
