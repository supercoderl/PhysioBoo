namespace PhysioBoo.Domain.Entities.Workspace
{
    // BoardId is kept on the card (as well as ListId) so a board loads with one query and a move
    // can check that the target column belongs to the same board.
    public class ScrumCard : TenantEntity
    {
        #region Core ScrumCard Table (6)
        public Guid BoardId { get; private set; }
        public Guid ListId { get; private set; }
        public string Title { get; private set; }
        public string? Description { get; private set; }
        public DateTime? DueDate { get; private set; }
        public int Position { get; private set; }
        #endregion

        #region Constructor (6)
        public ScrumCard(
            Guid id,
            Guid boardId,
            Guid listId,
            string title,
            string? description,
            DateTime? dueDate,
            int position
        ) : base(id)
        {
            BoardId = boardId;
            ListId = listId;
            Title = title;
            Description = description;
            DueDate = dueDate;
            Position = position;
        }
        #endregion

        #region Setter Methods (6)
        public void SetListId(Guid listId) { ListId = listId; }
        public void SetTitle(string title) { Title = title; }
        public void SetDescription(string? description) { Description = description; }
        public void SetDueDate(DateTime? dueDate) { DueDate = dueDate; }
        public void SetPosition(int position) { Position = position; }
        #endregion
    }
}
