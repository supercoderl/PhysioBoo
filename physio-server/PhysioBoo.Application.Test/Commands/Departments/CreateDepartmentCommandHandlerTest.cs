using NSubstitute;
using PhysioBoo.Application.Commands.Departments.CreateDepartment;
using PhysioBoo.Application.ViewModels.Departments;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Results;
using Xunit;

namespace PhysioBoo.Application.Test.Commands.Departments
{
    public sealed class CreateDepartmentCommandHandlerTest : CommandHandlerFixtureBase
    {
        [Fact]
        public async Task Should_Store_The_Department_Under_The_Server_Generated_Id()
        {
            IDepartmentRepository repository = Substitute.For<IDepartmentRepository>();
            Department? saved = null;
            repository.InsertAsync<Department, Guid>(Arg.Do<Department>(d => saved = d)).Returns(DbResult<Guid>.Ok(Guid.NewGuid()));
            CreateDepartmentCommandHandler handler = new(Bus, UnitOfWork, NotificationHandler, repository, User);

            Guid newId = Guid.NewGuid();
            // The admin form does not send an id, so the view model arrives with Guid.Empty.
            CreateDepartmentViewModel body = new(Guid.Empty, Guid.NewGuid(), "Cardiology", null, null, null, null, null, null, null, null, null, null);

            await handler.Handle(new CreateDepartmentCommand(body, newId), default);

            Assert.NotNull(saved);
            Assert.Equal(newId, saved!.Id);
        }
    }
}
