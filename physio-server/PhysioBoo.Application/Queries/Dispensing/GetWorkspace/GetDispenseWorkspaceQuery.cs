using PhysioBoo.Application.ViewModels.Dispensing;

namespace PhysioBoo.Application.Queries.Dispensing.GetWorkspace
{
    /// <summary>
    /// The queue id and workspace id are both the prescription id.
    /// </summary>
    public sealed record GetDispenseWorkspaceQuery(Guid PrescriptionId) : IRequest<DispenseWorkspaceViewModel?>;
}
