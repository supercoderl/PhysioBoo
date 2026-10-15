using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.Cms;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Entities.PatientInformation;
using Role = PhysioBoo.Domain.Entities.Core.Role;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Infrastructure.Database;
using PhysioBoo.Infrastructure.Repositories;
using PhysioBoo.SharedKernel.Results;
using Xunit;

namespace PhysioBoo.Infrastructure.IntegrationTest
{
    public sealed class RepositoryPersistenceTests : IClassFixture<PostgresFixture>
    {
        private readonly PostgresFixture _fixture;

        public RepositoryPersistenceTests(PostgresFixture fixture) => _fixture = fixture;

        [PgFact]
        public async Task Generic_Insert_Writes_Enums_To_Integer_Columns()
        {
            await using ApplicationDbContext context = _fixture.CreateContext();
            ArticleRepository repository = new(context);
            Article article = new(Guid.NewGuid(), "Draft", "draft", ArticleCategory.Research, null, null, "e", "c", "a", ArticleStatus.Draft, null, null);

            DbResult<Guid> result = await repository.InsertAsync<Article, Guid>(article);

            Assert.True(result.Success, result.Error);
            await using ApplicationDbContext verify = _fixture.CreateContext();
            Article stored = await verify.Articles.AsNoTracking().SingleAsync(a => a.Id == article.Id);
            Assert.Equal(ArticleCategory.Research, stored.Category);
            Assert.Equal(ArticleStatus.Draft, stored.Status);
        }

        [PgFact]
        public async Task Generic_Insert_Keeps_Writing_String_Mapped_Enums_By_Name()
        {
            await using ApplicationDbContext context = _fixture.CreateContext();
            HospitalRepository repository = new(context);
            Hospital hospital = new(Guid.NewGuid(), "Clinic", null, HospitalType.Clinic, 0, 0, "a", "c", "s", null, "vn",
                null, null, null, null, null, null, null, null, null, null, null, "acc", null, [], [], null, null, null, null, null, null, null);
            hospital.SetTenantId(PostgresFixture.TenantId);

            DbResult<Guid> result = await repository.InsertAsync<Hospital, Guid>(hospital);

            Assert.True(result.Success, result.Error);
            await using ApplicationDbContext verify = _fixture.CreateContext();
            string raw = await verify.Database.SqlQueryRaw<string>("SELECT \"HospitalType\" AS \"Value\" FROM \"Hospitals\" WHERE \"Id\" = {0}", hospital.Id).SingleAsync();
            Assert.Equal("Clinic", raw);
            Hospital stored = await verify.Hospitals.AsNoTracking().SingleAsync(h => h.Id == hospital.Id);
            Assert.Equal(HospitalType.Clinic, stored.HospitalType);
        }

        [PgFact]
        public async Task InsertPatientFullInfo_Persists_The_Patient_And_Its_Profile()
        {
            Guid doctorId = Guid.NewGuid();
            await using (ApplicationDbContext seed = _fixture.CreateContext())
            {
                User user = new(doctorId, "doc-" + doctorId.ToString("N")[..8] + "@example.test", "+8490" + doctorId.ToString("N")[..7], "hash");
                Profile doctorProfile = new(doctorId, "Doc", "Tor", "", new DateOnly(1980, 1, 1), Gender.Male, BloodGroup.A_Negative, MaritalStatus.Single,
                    null, null, null, null, null, null, null, null, null, PreferredCommunication.Email);
                Doctor doctor = new(doctorId, "DOC-" + doctorId.ToString("N")[..6], "LIC-" + doctorId.ToString("N")[..6], new DateOnly(2035, 1, 1),
                    null, null, null, null, null, null, null, null, null);
                DbResult<Guid> registered = await new DoctorRepository(seed).RegisterDoctor(user, doctorProfile, doctor, default);
                Assert.True(registered.Success, registered.Error);
            }

            Guid patientId = Guid.NewGuid();
            Guid profileId = Guid.NewGuid();
            Profile profile = new(profileId, "Pat", "Ient", "", new DateOnly(1990, 1, 1), Gender.Female, BloodGroup.B_Positive, MaritalStatus.Single,
                null, "pat-" + patientId.ToString("N")[..8] + "@example.test", "+8491" + patientId.ToString("N")[..7], null, null, null, null, null, null, PreferredCommunication.Email);
            profile.SetTenantId(PostgresFixture.TenantId);
            Patient patient = new(patientId, "PAT-" + patientId.ToString("N")[..6], null, profileId, doctorId, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null, null, null, null, null, null, null);
            patient.SetTenantId(PostgresFixture.TenantId);

            await using ApplicationDbContext context = _fixture.CreateContext();
            DbResult<Guid> result = await new PatientRepository(context).InsertPatientFullInfo(profile, patient, default);

            Assert.True(result.Success, result.Error);
            Assert.Equal(patientId, result.Id);
            await using ApplicationDbContext verify = _fixture.CreateContext();
            Assert.True(await verify.Patients.AnyAsync(p => p.Id == patientId && p.ProfileId == profileId), "the patient row was not written");
            Assert.True(await verify.Profiles.AnyAsync(p => p.Id == profileId), "the profile row was not written");
        }

        [PgFact]
        public async Task InsertWithRoles_Persists_The_User_And_Its_Role_Link_And_Reports_Duplicates()
        {
            Guid roleId = Guid.NewGuid();
            await using (ApplicationDbContext seed = _fixture.CreateContext())
            {
                seed.Roles.Add(new Role(roleId, "Staff " + roleId, "S" + roleId.ToString("N")[..8], null, null, null));
                await seed.SaveChangesAsync();
            }

            Guid userId = Guid.NewGuid();
            string email = "staff-" + userId.ToString("N")[..8] + "@example.test";
            User user = new(userId, email, "+8492" + userId.ToString("N")[..7], "hash");
            user.SetTenantId(PostgresFixture.TenantId);
            user.SetUserRole(new UserRole(Guid.NewGuid(), userId, roleId, null));

            await using ApplicationDbContext context = _fixture.CreateContext();
            DbResult<Guid> result = await new UserRepository(context).InsertWithRolesAsync(user);

            Assert.True(result.Success, result.Error);
            Assert.Equal(userId, result.Id);
            await using ApplicationDbContext verify = _fixture.CreateContext();
            Assert.True(await verify.Users.AnyAsync(u => u.Id == userId), "the user row was not written");
            Assert.True(await verify.UserRoles.AnyAsync(ur => ur.UserId == userId && ur.RoleId == roleId), "the role link was not written");

            // A second user with the same e-mail must fail cleanly and leave no half-created account behind.
            Guid dupId = Guid.NewGuid();
            User duplicate = new(dupId, email, "+8493" + dupId.ToString("N")[..7], "hash");
            duplicate.SetTenantId(PostgresFixture.TenantId);
            duplicate.SetUserRole(new UserRole(Guid.NewGuid(), dupId, roleId, null));
            await using ApplicationDbContext second = _fixture.CreateContext();
            DbResult<Guid> failed = await new UserRepository(second).InsertWithRolesAsync(duplicate);
            Assert.False(failed.Success);
            Assert.Contains("Duplicate", failed.Error);
            Assert.False(await verify.UserRoles.AnyAsync(ur => ur.UserId == dupId));
        }

        [PgFact]
        public async Task AssignPermissions_Grants_Revokes_And_Revives_Without_Duplicates()
        {
            Guid roleId = Guid.NewGuid();
            Guid readId = Guid.NewGuid();
            Guid writeId = Guid.NewGuid();
            string readCode = "it:thing:read-" + readId.ToString("N")[..6];
            string writeCode = "it:thing:write-" + writeId.ToString("N")[..6];
            await using (ApplicationDbContext seed = _fixture.CreateContext())
            {
                seed.Roles.Add(new Role(roleId, "Role " + roleId, "R" + roleId.ToString("N")[..8], null, null, null));
                seed.Permissions.Add(new Permission(readId, "Read", readCode, null));
                seed.Permissions.Add(new Permission(writeId, "Write", writeCode, null));
                await seed.SaveChangesAsync();
            }

            async Task<List<Guid>> Granted()
            {
                await using ApplicationDbContext c = _fixture.CreateContext();
                return await c.RolePermissions.AsNoTracking().Where(rp => rp.RoleId == roleId).Select(rp => rp.PermissionId).OrderBy(x => x).ToListAsync();
            }

            async Task Assign(Dictionary<string, bool> map)
            {
                await using ApplicationDbContext c = _fixture.CreateContext();
                await new RolePermissionRepository(c).AssignPermissionsAsync(roleId, map);
            }

            await Assign(new() { [readCode] = true, [writeCode] = true, ["does:not:exist"] = true });
            Assert.Equal(new[] { readId, writeId }.OrderBy(x => x), await Granted());

            await Assign(new() { [readCode] = true, [writeCode] = true });
            Assert.Equal(2, (await Granted()).Count);

            await Assign(new() { [writeCode] = false });
            Assert.Equal(new[] { readId }, await Granted());

            // A soft-deleted link still occupies the unique (RoleId, PermissionId) index: granting again must revive it.
            await using (ApplicationDbContext soft = _fixture.CreateContext())
            {
                await soft.Database.ExecuteSqlRawAsync("UPDATE \"RolePermissions\" SET \"DeletedAt\" = now() WHERE \"RoleId\" = {0}", roleId);
            }
            Assert.Empty(await Granted());
            await Assign(new() { [readCode] = true });
            Assert.Equal(new[] { readId }, await Granted());
        }

        [PgFact]
        public async Task User_Transaction_Needs_The_Execution_Strategy_And_Rolls_Back_On_Failure()
        {
            await using ApplicationDbContext context = _fixture.CreateContext();
            UnitOfWork<ApplicationDbContext> unitOfWork = _fixture.CreateUnitOfWork(context);

            // Without the wrapper the retrying strategy rejects the first query inside a user transaction.
            await unitOfWork.BeginTransactionAsync();
            await Assert.ThrowsAsync<InvalidOperationException>(() => context.Roles.CountAsync());
            await unitOfWork.RollbackTransactionAsync();

            Guid roleId = Guid.NewGuid();
            await using ApplicationDbContext failing = _fixture.CreateContext();
            UnitOfWork<ApplicationDbContext> failingUow = _fixture.CreateUnitOfWork(failing);
            await Assert.ThrowsAsync<InvalidOperationException>(() => failingUow.ExecuteInStrategyAsync(async () =>
            {
                await failingUow.BeginTransactionAsync();
                failing.Roles.Add(new Role(roleId, "Rolled back", "RB" + roleId.ToString("N")[..8], null, null, null));
                await failing.SaveChangesAsync();
                throw new InvalidOperationException("boom");
            }));

            await using ApplicationDbContext verify = _fixture.CreateContext();
            Assert.False(await verify.Roles.AnyAsync(r => r.Id == roleId));

            Guid okId = Guid.NewGuid();
            await using ApplicationDbContext working = _fixture.CreateContext();
            UnitOfWork<ApplicationDbContext> workingUow = _fixture.CreateUnitOfWork(working);
            await workingUow.ExecuteInStrategyAsync(async () =>
            {
                await workingUow.BeginTransactionAsync();
                Assert.False(await working.Roles.AnyAsync(r => r.Id == okId)); // an ordinary query inside the transaction
                working.Roles.Add(new Role(okId, "Committed", "OK" + okId.ToString("N")[..8], null, null, null));
                await workingUow.CommitTransactionAsync();
            });

            await using ApplicationDbContext after = _fixture.CreateContext();
            Assert.True(await after.Roles.AnyAsync(r => r.Id == okId));
        }
    }
}
