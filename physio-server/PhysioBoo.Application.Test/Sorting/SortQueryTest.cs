using PhysioBoo.Application.ViewModels.Sorting;
using Xunit;

namespace PhysioBoo.Application.Test.Sorting
{
    public sealed class SortQueryTest
    {
        [Theory]
        [InlineData("createdAt:desc", "createdat", SortOrder.Descending)]
        [InlineData("name:asc", "name", SortOrder.Ascending)]
        [InlineData("name:descending", "name", SortOrder.Descending)]
        [InlineData("+name", "name", SortOrder.Ascending)]
        [InlineData("-name", "name", SortOrder.Descending)]
        [InlineData("name desc", "name", SortOrder.Descending)]
        [InlineData("desc(name)", "name", SortOrder.Descending)]
        public void Should_Parse_Single_Sort_Parameter(string query, string expectedName, SortOrder expectedOrder)
        {
            SortQuery sort = new SortQuery { Query = query };

            SortParameter parameter = Assert.Single(sort.Parameters);
            Assert.Equal(expectedName, parameter.ParameterName);
            Assert.Equal(expectedOrder, parameter.Order);
        }

        [Fact]
        public void Should_Parse_Multiple_Colon_Style_Parameters()
        {
            SortQuery sort = new SortQuery { Query = "name:asc,createdAt:desc" };

            Assert.Equal(2, sort.Parameters.Count);
            Assert.Equal("name", sort.Parameters[0].ParameterName);
            Assert.Equal(SortOrder.Ascending, sort.Parameters[0].Order);
            Assert.Equal("createdat", sort.Parameters[1].ParameterName);
            Assert.Equal(SortOrder.Descending, sort.Parameters[1].Order);
        }

        [Fact]
        public void Should_Reject_Unknown_Order_In_Colon_Style()
        {
            Assert.Throws<ArgumentException>(() => new SortQuery { Query = "name:sideways" });
        }
    }
}
