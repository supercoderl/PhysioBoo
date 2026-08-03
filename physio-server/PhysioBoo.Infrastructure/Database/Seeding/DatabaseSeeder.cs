using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using PhysioBoo.Domain.Constants;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Seeding;
using PhysioBoo.SharedKernel.Attributes;
using PhysioBoo.SharedKernel.Utils;
using System.Reflection;

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

        public async Task MigrateAsync(CancellationToken ct = default)
        {
            await _context.Database.MigrateAsync(ct);
            _logger.LogInformation("Database migrations applied.");
        }

        public async Task SeedAsync(CancellationToken ct = default)
        {
            await using Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction transaction = await _context.Database.BeginTransactionAsync(ct);

            try
            {
                await SeedRoleAsync(ct);
                await SeedSystemAdminAsync(ct);
                await SeedPermissionsAsync(ct);
                await SeedSuperAdminPermissionsAsync(ct);
                await SeedAdminMenusAsync(ct);

                if (_hostEnvironment.IsDevelopment())
                {
                    await SetDevelopmentDataAsync();
                    await transaction.CommitAsync(ct);
                    _logger.LogInformation("Database seeding completed.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database seeding failed. Rolling back.");
                await transaction.RollbackAsync(ct);
                throw;
            }
        }

        private async Task SeedRoleAsync(CancellationToken ct = default)
        {
            HashSet<string> existingCodes = await _context.Roles.Select(r => r.Code).ToHashSetAsync(ct);
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

        private async Task SeedSystemAdminAsync(CancellationToken ct = default)
        {
            string superAdminCode = Role.SUPER_ADMIN.ToString();
            Guid? superAdminRoleId = await _context.Roles.Where(r => r.Code == superAdminCode)
                .Select(r => (Guid?)r.Id)
                .FirstOrDefaultAsync(ct)
                ?? throw new InvalidOperationException("SUPER_ADMIN role not found after seeding.");

            if (await _context.UserRoles.AnyAsync(ur => ur.RoleId == superAdminRoleId, ct)) return;

            string password = _configuration["Seeding:AdminPassword"] ?? (_hostEnvironment.IsDevelopment() ? UserConstants.Password :
                throw new InvalidOperationException("Seeding: AdminPassword must be configured in production."));

            Domain.Entities.Core.Role? role = await _context.Roles
                .FirstOrDefaultAsync(r => r.Code == Role.SUPER_ADMIN.ToString(), ct)
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
            await _context.SaveSeedChangesAsync(ct);

            _logger.LogInformation("Seeded system admin user.");
        }

        private async Task SeedPermissionsAsync(CancellationToken ct = default)
        {
            HashSet<string> existingCodes = await _context.Permissions.Select(p => p.Code).ToHashSetAsync(ct);

            List<Domain.Entities.Core.Permission> permissions = new List<Domain.Entities.Core.Permission>();

            foreach (Type group in typeof(Permissions).GetNestedTypes(BindingFlags.Public | BindingFlags.Static))
            {
                foreach (FieldInfo field in group.GetFields(BindingFlags.Public | BindingFlags.Static))
                {
                    if (field.FieldType != typeof(string)) continue;

                    string code = (string)field.GetValue(null)!;
                    if (existingCodes.Contains(code)) continue;

                    string name = $"{group.Name}: {field.Name}";
                    permissions.Add(new Domain.Entities.Core.Permission(Guid.NewGuid(), name, code, null));
                    existingCodes.Add(code);
                }
            }

            if (permissions.Count > 0)
            {
                await _context.Permissions.AddRangeAsync(permissions, ct);
                await _context.SaveChangesAsync(ct);
                _logger.LogInformation("Seeded {Count} new permission(s).", permissions.Count);
            }
        }

        private async Task SeedSuperAdminPermissionsAsync(CancellationToken ct = default)
        {
            string superAdminCode = Role.SUPER_ADMIN.ToString();
            Guid superAdminRoleId = await _context.Roles
                .Where(r => r.Code == superAdminCode)
                .Select(r => r.Id)
                .FirstAsync(ct);

            HashSet<Guid> grantedPermissionIds = await _context.RolePermissions
                .Where(rp => rp.RoleId == superAdminRoleId)
                .Select(rp => rp.PermissionId)
                .ToHashSetAsync(ct);

            List<Guid> allPermissionIds = await _context.Permissions
                .Select(p => p.Id)
                .ToListAsync(ct);

            List<Domain.Entities.Core.RolePermission> newGrants = allPermissionIds
                .Where(id => !grantedPermissionIds.Contains(id))
                .Select(id => new Domain.Entities.Core.RolePermission(Guid.NewGuid(), superAdminRoleId, id))
                .ToList();

            if (newGrants.Count > 0)
            {
                await _context.RolePermissions.AddRangeAsync(newGrants, ct);
                await _context.SaveChangesAsync(ct);
                _logger.LogInformation("Granted {Count} permission(s) to SUPER_ADMIN.", newGrants.Count);
            }
        }

        private async Task SeedAdminMenusAsync(CancellationToken ct = default)
        {
            if (await _context.AdminMenus.AnyAsync(ct)) return;

            // label, icon, route, permissionCode ("" = always visible), children
            (string Label, string Icon, string Route, string PermissionCode, (string, string, string, string)[]? Children)[] sections =
            {
                ("Reception", "clipboard-list", "/admin/reception", "", new []
                {
                    ("Booking", "calendar-check", "/admin/reception/booking/list", Permissions.Reception.BookingRead),
                    ("Queue", "list-ordered", "/admin/reception/queue", Permissions.Reception.QueueRead),
                    ("Registration", "user-plus", "/admin/reception/registration", Permissions.Reception.PatientRegister),
                }),
                ("Clinic", "stethoscope", "/admin/clinic", "", new []
                {
                    ("Doctor Desk", "monitor", "/admin/clinic/doctor-desk", Permissions.Clinical.MedicalRecordRead),
                    ("Prescription", "file-text", "/admin/clinic/prescription", Permissions.Pharmacy.PrescriptionRead),
                    ("Medical Record", "folder-heart", "/admin/clinic/medical-record", Permissions.Clinical.MedicalRecordRead),
                }),
                ("Inpatient", "bed", "/admin/inpatient", "", new []
                {
                    ("Bed Map", "layout-grid", "/admin/inpatient/bed-map", ""),
                    ("Admission", "door-open", "/admin/inpatient/admission", ""),
                    ("Nursing Dashboard", "heart-pulse", "/admin/inpatient/nursing/dashboard", ""),
                    ("Nursing Handover", "repeat", "/admin/inpatient/nursing/handover", ""),
                    ("Treatment Sheet", "clipboard-pen", "/admin/inpatient/treatment-sheet", ""),
                }),
                ("Paraclinical", "flask-conical", "/admin/paraclinical", "", new []
                {
                    ("Laboratory", "test-tube", "/admin/paraclinical/laboratory", Permissions.Lab.LabOrderRead),
                    ("Radiology", "scan", "/admin/paraclinical/radiology", Permissions.Imaging.ImagingOrderRead),
                    ("Surgery", "scissors", "/admin/paraclinical/surgery", ""),
                }),
                ("Pharmacy", "pill", "/admin/pharmacy", "", new []
                {
                    ("Retail", "shopping-cart", "/admin/pharmacy/retail", Permissions.Pharmacy.MedicineInventoryRead),
                    ("Prescription Dispense", "package-check", "/admin/pharmacy/prescription-dispense", Permissions.Pharmacy.PrescriptionRead),
                    ("Inventory Management", "boxes", "/admin/pharmacy/inventory-management", Permissions.Pharmacy.MedicineInventoryRead),
                    ("Stock Take", "clipboard-check", "/admin/pharmacy/stock-take", Permissions.Pharmacy.MedicineInventoryRead),
                }),
                ("Finance", "wallet", "/admin/finance", "", new []
                {
                    ("Cashier", "banknote", "/admin/finance/cashier", Permissions.Billing.BillRead),
                    ("Insurance", "shield-check", "/admin/finance/insurance", Permissions.Admin.InsuranceCompanyRead),
                    ("Reports", "bar-chart-3", "/admin/finance/reports", Permissions.Billing.BillRead),
                }),
                ("CRM", "users", "/admin/crm", "", new []
                {
                    ("Patient", "user", "/admin/crm/patient", ""),
                    ("Marketing Campaign", "megaphone", "/admin/crm/marketing-campaign", ""),
                    ("Lead Management", "target", "/admin/crm/lead-management", ""),
                    ("Support Complaint", "message-circle-warning", "/admin/crm/support-complaint", ""),
                    ("Member Point", "star", "/admin/crm/member-point", ""),
                }),
                ("CMS", "newspaper", "/admin/cms", "", new []
                {
                    ("Article News", "file-text", "/admin/cms/article-news", ""),
                    ("Service", "concierge-bell", "/admin/cms/service", ""),
                    ("Home Configuration", "layout-dashboard", "/admin/cms/home-configuration", ""),
                    ("Doctor", "user-round", "/admin/cms/doctor/list", ""),
                }),
                ("Academy", "graduation-cap", "/admin/academy/list", "", null),
                ("System", "settings", "/admin/system", "", new []
                {
                    ("File Manager", "folder", "/admin/system/file-manager", ""),
                    ("Note", "sticky-note", "/admin/system/note/all", ""),
                    ("Scrumboard", "kanban", "/admin/system/scrumboard/list", ""),
                    ("User Permission", "shield", "/admin/system/user-permission", Permissions.Iam.UserRead),
                    ("Print Templates", "printer", "/admin/system/print-templates", Permissions.Admin.PrintTemplateManage),
                    ("Settings", "settings-2", "/admin/system/settings", ""),
                }),
            };

            List<Domain.Entities.Core.AdminMenu> menus = new List<Domain.Entities.Core.AdminMenu>();
            int rootOrder = 0;

            foreach (var section in sections)
            {
                Domain.Entities.Core.AdminMenu root = new Domain.Entities.Core.AdminMenu(
                    Guid.NewGuid(), section.Label, section.Icon, section.Route, null, rootOrder++, section.PermissionCode);
                root.SetCreatedBy(UserConstants.AdminId);
                menus.Add(root);

                if (section.Children == null) continue;

                int childOrder = 0;
                foreach (var child in section.Children)
                {
                    Domain.Entities.Core.AdminMenu childMenu = new Domain.Entities.Core.AdminMenu(
                        Guid.NewGuid(), child.Item1, child.Item2, child.Item3, root.Id, childOrder++, child.Item4);
                    childMenu.SetCreatedBy(UserConstants.AdminId);
                    menus.Add(childMenu);
                }
            }

            await _context.AdminMenus.AddRangeAsync(menus, ct);
            await _context.SaveChangesAsync(ct);
            _logger.LogInformation("Seeded {Count} admin menu item(s).", menus.Count);
        }

        private async Task SetDevelopmentDataAsync(CancellationToken ct = default)
        {
            string tenantName = "PhysioBoo Rehabilitation Hospital";
            if (await _context.HospitalGroups.AnyAsync(t => t.Name == tenantName, ct)) return;

            Domain.Entities.Operation.HospitalGroup testTenant = new Domain.Entities.Operation.HospitalGroup(
                    Guid.NewGuid(),
                    tenantName,
                    null, null, null,
                    null, null, null,
                    null, null, null
                );

            _context.HospitalGroups.Add(testTenant);
            await _context.SaveSeedChangesAsync(ct);

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
            await _context.SaveSeedChangesAsync(ct);
            _logger.LogInformation("Seeded development tenant '{Tenant}'", tenantName);
        }
    }
}
