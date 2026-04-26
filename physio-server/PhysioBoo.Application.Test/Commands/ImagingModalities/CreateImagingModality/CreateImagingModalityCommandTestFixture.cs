using NSubstitute;
using PhysioBoo.Application.Commands.ImagingModalities.CreateImagingModality;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Results;

namespace PhysioBoo.Application.Test.Commands.ImagingModalities.CreateImagingModality
{
    public sealed class CreateImagingModalityCommandTestFixture : CommandHandlerFixtureBase
    {
        public CreateImagingModalityCommandHandler CommandHandler { get; }
        public IImagingModalityRepository ImagingModalityRepository { get; }

        public CreateImagingModalityCommandTestFixture()
        {
            ImagingModalityRepository = Substitute.For<IImagingModalityRepository>();

            CommandHandler = new CreateImagingModalityCommandHandler(
                Bus,
                UnitOfWork,
                NotificationHandler,
                ImagingModalityRepository
            );
        }

        public void SetupInsertSuccess()
        {
            ImagingModalityRepository
                .InsertAsync<ImagingModality, Guid>(Arg.Any<ImagingModality>())
                .Returns(DbResult<Guid>.Ok(Guid.NewGuid()));
        }

        public void SetupInsertFailure()
        {
            ImagingModalityRepository
                .InsertAsync<ImagingModality, Guid>(Arg.Any<ImagingModality>())
                .Returns(DbResult<Guid>.Fail("Database error"));
        }
    }
}
