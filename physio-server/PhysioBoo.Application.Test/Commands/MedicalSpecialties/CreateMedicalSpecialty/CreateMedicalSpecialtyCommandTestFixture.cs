using NSubstitute;
using PhysioBoo.Application.Commands.MedicalSpecialties.CreateMedicalSpecialty;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Results;

namespace PhysioBoo.Application.Test.Commands.MedicalSpecialties.CreateMedicalSpecialty
{
    public sealed class CreateMedicalSpecialtyCommandTestFixture : CommandHandlerFixtureBase
    {
        public CreateMedicalSpecialtyCommandHandler CommandHandler { get; }
        public IMedicalSpecialtyRepository MedicalSpecialtyRepository { get; }

        public CreateMedicalSpecialtyCommandTestFixture()
        {
            MedicalSpecialtyRepository = Substitute.For<IMedicalSpecialtyRepository>();

            CommandHandler = new CreateMedicalSpecialtyCommandHandler(
                Bus,
                UnitOfWork,
                NotificationHandler,
                MedicalSpecialtyRepository
            );
        }

        public void SetupInsertSuccess()
        {
            MedicalSpecialtyRepository
                .InsertAsync<MedicalSpecialty, Guid>(Arg.Any<MedicalSpecialty>())
                .Returns(DbResult<Guid>.Ok(Guid.NewGuid()));
        }

        public void SetupInsertFailure()
        {
            MedicalSpecialtyRepository
                .InsertAsync<MedicalSpecialty, Guid>(Arg.Any<MedicalSpecialty>())
                .Returns(DbResult<Guid>.Fail("Database error"));
        }
    }
}
