using NSubstitute;
using PhysioBoo.Application.Commands.AppointmentTypes.CreateAppointmentType;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Results;

namespace PhysioBoo.Application.Test.Commands.AppointmentTypes.CreateAppointmentType
{
    public sealed class CreateAppointmentTypeCommandTestFixture : CommandHandlerFixtureBase
    {
        public CreateAppointmentTypeCommandHandler CommandHandler { get; }
        public IAppointmentTypeRepository AppointmentTypeRepository { get; }
        public ISys_SequenceTrackerRepository Sys_SequenceTrackerRepository { get; }

        public CreateAppointmentTypeCommandTestFixture()
        {
            AppointmentTypeRepository = Substitute.For<IAppointmentTypeRepository>();
            Sys_SequenceTrackerRepository = Substitute.For<ISys_SequenceTrackerRepository>();

            CommandHandler = new CreateAppointmentTypeCommandHandler(
                Bus,
                UnitOfWork,
                NotificationHandler,
                AppointmentTypeRepository,
                Sys_SequenceTrackerRepository
            );
        }

        public void SetupInsertSuccess()
        {
            AppointmentTypeRepository
                .InsertAsync<AppointmentType, Guid>(Arg.Any<AppointmentType>())
                .Returns(DbResult<Guid>.Ok(Guid.NewGuid()));
        }

        public void SetupInsertFailure()
        {
            AppointmentTypeRepository
                .InsertAsync<AppointmentType, Guid>(Arg.Any<AppointmentType>())
                .Returns(DbResult<Guid>.Fail("Database error"));
        }
    }
}
