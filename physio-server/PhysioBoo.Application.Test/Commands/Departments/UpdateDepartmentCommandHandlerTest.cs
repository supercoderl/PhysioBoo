using NSubstitute;
using PhysioBoo.Application.Commands.Departments.UpdateDepartment;
using PhysioBoo.Application.ViewModels.Departments;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Interfaces.Repositories;
using Xunit;

namespace PhysioBoo.Application.Test.Commands.Departments
{
    public sealed class UpdateDepartmentCommandHandlerTest : CommandHandlerFixtureBase
    {
        [Fact]
        public async Task Should_Update_The_Department_Addressed_By_The_Route_Id_Not_The_Body_Id()
        {
            IDepartmentRepository repository = Substitute.For<IDepartmentRepository>();
            Guid routeId = Guid.NewGuid();
            Department existing = new(routeId, Guid.NewGuid(), "Old", null, null, null, null, null, null, null, null, null, null);
            repository.GetByIdAsync(routeId, Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns(existing);
            UpdateDepartmentCommandHandler handler = new(Bus, UnitOfWork, NotificationHandler, repository, User);

            // The admin form never sends an id in the body, so it arrives as Guid.Empty.
            UpdateDepartmentViewModel body = new(Guid.Empty, existing.HospitalId, "New name", null, null, null, null, null, null, null, null, null, null, 0, false, false, true, false, true);

            await handler.Handle(new UpdateDepartmentCommand(body, routeId), default);

            Assert.Equal("New name", existing.Name);
            VerifyNoDomainNotification();
        }
    }
}
