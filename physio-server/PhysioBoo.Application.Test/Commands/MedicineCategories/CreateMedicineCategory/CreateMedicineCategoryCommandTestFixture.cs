using NSubstitute;
using PhysioBoo.Application.Commands.MedicineCategories.CreateMedicineCategory;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Results;

namespace PhysioBoo.Application.Test.Commands.MedicineCategories.CreateMedicineCategory
{
    public sealed class CreateMedicineCategoryCommandTestFixture : CommandHandlerFixtureBase
    {
        public CreateMedicineCategoryCommandHandler CommandHandler { get; }
        public IMedicineCategoryRepository MedicineCategoryRepository { get; }
        public ISys_SequenceTrackerRepository Sys_SequenceTrackerRepository { get; }

        public CreateMedicineCategoryCommandTestFixture()
        {
            MedicineCategoryRepository = Substitute.For<IMedicineCategoryRepository>();
            Sys_SequenceTrackerRepository = Substitute.For<ISys_SequenceTrackerRepository>();

            CommandHandler = new CreateMedicineCategoryCommandHandler(
                Bus,
                UnitOfWork,
                NotificationHandler,
                MedicineCategoryRepository,
                Sys_SequenceTrackerRepository,
                User
            );
        }

        public void SetupInsertSuccess()
        {
            MedicineCategoryRepository
                .InsertAsync<MedicineCategory, Guid>(Arg.Any<MedicineCategory>())
                .Returns(DbResult<Guid>.Ok(Guid.NewGuid()));
        }

        public void SetupInsertFailure()
        {
            MedicineCategoryRepository
                .InsertAsync<MedicineCategory, Guid>(Arg.Any<MedicineCategory>())
                .Returns(DbResult<Guid>.Fail("Database error"));
        }
    }
}
