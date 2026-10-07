using PhysioBoo.Domain.Entities.Cms;

namespace PhysioBoo.Application.ViewModels.HomeContent
{
    public sealed record HomeTestimonialViewModel(
        Guid Id,
        string PatientName,
        int Rating,
        string? Comment,
        DateTime? Date,
        bool Active
    )
    {
        public static HomeTestimonialViewModel FromEntity(HomeTestimonial e)
        {
            return new HomeTestimonialViewModel(
                e.Id,
                e.PatientName,
                e.Rating,
                e.Comment,
                e.Date,
                e.Active
            );
        }
    }
}
