using Grpc.Net.Client;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PhysioBoo.gRPC.Contexts;
using PhysioBoo.gRPC.Interfaces;
using PhysioBoo.gRPC.Models;
using PhysioBoo.Proto.Users;

namespace PhysioBoo.gRPC.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddGrpcClient(
        this IServiceCollection services,
        IConfiguration configuration,
        string configSectionKey = "gRPC")
        {
            var settings = new GRPCSettings();
            configuration.Bind(configSectionKey, settings);

            return AddGrpcClient(services, settings);
        }

        public static IServiceCollection AddGrpcClient(this IServiceCollection services, GRPCSettings settings)
        {
            if (!string.IsNullOrWhiteSpace(settings.PhysioBooUrl))
            {
                services.AddGrpcClient(settings.PhysioBooUrl);
            }

            services.AddSingleton<IPhysioBoo, PhysioBoo>();

            return services;
        }

        private static IServiceCollection AddGrpcClient(this IServiceCollection services, string gRPCUrl)
        {
            if (string.IsNullOrWhiteSpace(gRPCUrl))
            {
                return services;
            }

            var channel = GrpcChannel.ForAddress(gRPCUrl);

            var usersClient = new UsersApi.UsersApiClient(channel);
            services.AddSingleton(usersClient);

            services.AddSingleton<IUsersContext, UsersContext>();

            return services;
        }
    }
}
