using PhysioBoo.Domain.Entities.Workspace;

namespace PhysioBoo.Application.ViewModels.Scrumboard
{
    // One tile on the board list.
    public sealed class ScrumBoardSummaryViewModel
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int ListCount { get; set; }
        public int CardCount { get; set; }
        public DateTime UpdatedAt { get; set; }

        public static ScrumBoardSummaryViewModel FromEntity(ScrumBoard entity, int listCount, int cardCount)
        {
            return new ScrumBoardSummaryViewModel
            {
                Id = entity.Id,
                Title = entity.Title,
                Description = entity.Description,
                ListCount = listCount,
                CardCount = cardCount,
                UpdatedAt = entity.UpdatedAt ?? entity.CreatedAt
            };
        }
    }

    public sealed class ScrumCardViewModel
    {
        public Guid Id { get; set; }
        public Guid ListId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }
        public int Position { get; set; }

        public static ScrumCardViewModel FromEntity(ScrumCard entity)
        {
            return new ScrumCardViewModel
            {
                Id = entity.Id,
                ListId = entity.ListId,
                Title = entity.Title,
                Description = entity.Description,
                DueDate = entity.DueDate,
                Position = entity.Position
            };
        }
    }

    public sealed class ScrumListViewModel
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public int Position { get; set; }
        public List<ScrumCardViewModel> Cards { get; set; } = new();

        public static ScrumListViewModel FromEntity(ScrumList entity, IEnumerable<ScrumCard>? cards = null)
        {
            return new ScrumListViewModel
            {
                Id = entity.Id,
                Title = entity.Title,
                Position = entity.Position,
                Cards = (cards ?? Enumerable.Empty<ScrumCard>()).OrderBy(c => c.Position).Select(ScrumCardViewModel.FromEntity).ToList()
            };
        }
    }

    // A whole board: its columns left to right, each with its cards top to bottom.
    public sealed class ScrumBoardViewModel
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool CanDelete { get; set; }
        public List<ScrumListViewModel> Lists { get; set; } = new();
    }

    public sealed record SaveScrumBoardViewModel(string Title, string? Description);

    public sealed record SaveScrumListViewModel(string Title);

    public sealed record SaveScrumCardViewModel(string Title, string? Description, DateTime? DueDate);

    public sealed record MoveScrumCardViewModel(Guid TargetListId, int TargetIndex);

    public sealed record MoveScrumListViewModel(int TargetIndex);
}
