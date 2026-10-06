namespace PhysioBoo.Domain.Entities.Workspace
{
    // A column of a board. Position is 0-based and left to right.
    public class ScrumList : TenantEntity
    {
        #region Core ScrumList Table (3)
        public Guid BoardId { get; private set; }
        public string Title { get; private set; }
        public int Position { get; private set; }
        #endregion

        #region Constructor (3)
        public ScrumList(
            Guid id,
            Guid boardId,
            string title,
            int position
        ) : base(id)
        {
            BoardId = boardId;
            Title = title;
            Position = position;
        }
        #endregion

        #region Setter Methods (3)
        public void SetTitle(string title) { Title = title; }
        public void SetPosition(int position) { Position = position; }
        #endregion
    }
}
