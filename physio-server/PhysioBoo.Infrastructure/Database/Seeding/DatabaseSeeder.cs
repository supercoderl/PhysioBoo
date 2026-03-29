using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using PhysioBoo.Domain.Constants;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Seeding;
using PhysioBoo.SharedKernel.Attributes;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Infrastructure.Database.Seeding
{
    public class DatabaseSeeder : IDatabaseSeeder
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IHostEnvironment _hostEnvironment;
        private readonly ILogger<DatabaseSeeder> _logger;

        public DatabaseSeeder(
            ApplicationDbContext context,
            IConfiguration configuration,
            IHostEnvironment hostEnvironment,
            ILogger<DatabaseSeeder> logger
        )
        {
            _context = context;
            _configuration = configuration;
            _hostEnvironment = hostEnvironment;
            _logger = logger;
        }

        public async Task MigrateAsync(CancellationToken cancellationToken = default)
        {
            await _context.Database.MigrateAsync(cancellationToken);
            _logger.LogInformation("Database migrations applied.");
        }

        public async Task SeedAsync(CancellationToken cancellationToken = default)
        {
            await using Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

            try
            {
                await SeedRoleAsync(cancellationToken);
                await SeedSystemAdminAsync(cancellationToken);

                if (_hostEnvironment.IsDevelopment())
                {
                    await SetDevelopmentDataAsync();
                    await transaction.CommitAsync(cancellationToken);
                    _logger.LogInformation("Database seeding completed.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database seeding failed. Rolling back.");
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        }

        private async Task SeedRoleAsync(CancellationToken cancellationToken = default)
        {
            HashSet<string> existingCodes = await _context.Roles.Select(r => r.Code).ToHashSetAsync(cancellationToken);
            List<Domain.Entities.Core.Role> roles = new List<Domain.Entities.Core.Role>();

            foreach (Role role in Enum.GetValues<Role>())
            {
                string roleCode = role.ToString();

                if (existingCodes.Contains(roleCode)) continue;

                RoleMetadataAttribute? metadata = EnumHelper.GetAttribute<Role, RoleMetadataAttribute>(role);

                if (metadata == null) continue;

                Domain.Entities.Core.Role newRole = new Domain.Entities.Core.Role(
                    Guid.NewGuid(),
                    metadata.Name,
                    roleCode,
                    metadata.Description,
                    null,
                    null,
                    metadata.IsSystemRole,
                    metadata.IsPublicForRegistration
                );

                newRole.SetCreatedBy(UserConstants.AdminId);
                roles.Add(newRole);
            }

            if (roles.Count > 0)
            {
                await _context.Roles.AddRangeAsync(roles);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Seeded {Count} new role(s).", roles.Count);
            }
        }

        private async Task SeedSystemAdminAsync(CancellationToken cancellationToken = default)
        {
            string superAdminCode = Role.SUPER_ADMIN.ToString();
            Guid? superAdminRoleId = await _context.Roles.Where(r => r.Code == superAdminCode)
                .Select(r => (Guid?)r.Id)
                .FirstOrDefaultAsync(cancellationToken)
                ?? throw new InvalidOperationException("SUPER_ADMIN role not found after seeding.");

            if (await _context.UserRoles.AnyAsync(ur => ur.RoleId == superAdminRoleId, cancellationToken)) return;

            string password = _configuration["Seeding:AdminPassword"] ?? (_hostEnvironment.IsDevelopment() ? UserConstants.Password :
                throw new InvalidOperationException("Seeding: AdminPassword must be configured in production."));

            Domain.Entities.Core.Role? role = await _context.Roles
                .FirstOrDefaultAsync(r => r.Code == Role.SUPER_ADMIN.ToString(), cancellationToken)
                ?? throw new InvalidOperationException("SUPER_ADMIN role not found after seeding.");

            Domain.Entities.Core.User admin = new Domain.Entities.Core.User(
                UserConstants.AdminId,
                UserConstants.AdminEmail,
                UserConstants.AdminPhone,
                AuthHelper.HashPassword(password)
            );

            Domain.Entities.Core.UserRole userRole = new Domain.Entities.Core.UserRole(
                Guid.NewGuid(),
                UserConstants.AdminId,
                superAdminRoleId.Value,
                null
            );

            _context.Users.Add(admin);
            _context.UserRoles.Add(userRole);
            await _context.SaveSeedChangesAsync(cancellationToken);

            _logger.LogInformation("Seeded system admin user.");
        }

        private async Task SetDevelopmentDataAsync(CancellationToken cancellationToken = default)
        {
            string tenantName = "PhysioBoo Rehabilitation Hospital";
            if (await _context.HospitalGroups.AnyAsync(t => t.Name == tenantName, cancellationToken)) return;

            Domain.Entities.Operation.HospitalGroup testTenant = new Domain.Entities.Operation.HospitalGroup(
                    Guid.NewGuid(),
                    tenantName,
                    null, null, null,
                    null, null, null,
                    null, null, null
                );

            _context.HospitalGroups.Add(testTenant);
            await _context.SaveSeedChangesAsync(cancellationToken);

            Domain.Entities.Operation.Hospital mainBranch = new Domain.Entities.Operation.Hospital(
                Guid.NewGuid(), "", null, HospitalType.General, 0, 0, "", "", "", null, "", null, null,
                null, null, null, null, null, null, null, null, null, "", null, [], [], null, null, null, null, null,
                null, null);

            mainBranch.SetTenantId(testTenant.Id);

            _context.Hospitals.Add(mainBranch);

            Domain.Entities.Core.User tenantAdmin = new Domain.Entities.Core.User(
                Guid.NewGuid(),
                "it@physioboo.com",
                "+1234567890",
                AuthHelper.HashPassword(_configuration["Seeding:DevTenantAdminPassword"] ?? UserConstants.Password)
            );

            _context.Users.Add(tenantAdmin);
            await _context.SaveSeedChangesAsync(cancellationToken);
            _logger.LogInformation("Seeded development tenant '{Tenant}'", tenantName);
        }
    }
}
