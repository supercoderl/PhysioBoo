using PhysioBoo.Application.ViewModels.Payments;

namespace PhysioBoo.Application.Interfaces.Payment
{
    public interface IPaymentGateway
    {
        string ProviderName { get; }

        Task<GatewayCreateResult> CreateAsync(GatewayCreateViewModel request, CancellationToken ct = default);

        Task<GatewayStatusResult> HandleNotificationAsync(GatewayNotificationContext context, CancellationToken ct = default);

        Task<GatewayStatusResult> QueryStatusAsync(string merchantReference, CancellationToken ct = default);
    }
}
