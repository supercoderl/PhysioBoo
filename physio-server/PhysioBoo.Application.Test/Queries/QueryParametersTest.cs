using PhysioBoo.SharedKernel.Common;
using Xunit;

namespace PhysioBoo.Application.Test.Queries
{
    public sealed class QueryParametersTest
    {
        [Theory]
        [InlineData(200, 200)]
        [InlineData(500, 500)]
        [InlineData(5000, 500)]
        public void PageSize_Allows_The_Lookup_Sizes_The_Admin_UI_Requests(int requested, int expected)
        {
            QueryParameters parameters = new() { PageSize = requested };

            Assert.Equal(expected, parameters.PageSize);
        }
    }
}
