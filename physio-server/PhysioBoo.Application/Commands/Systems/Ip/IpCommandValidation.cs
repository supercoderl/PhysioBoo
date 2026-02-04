using FluentValidation;

namespace PhysioBoo.Application.Commands.Systems.Ip
{
    public sealed class BlockIpCommandValidation : AbstractValidator<BlockIpCommand>
    {
        public BlockIpCommandValidation()
        {

        }
    }

    public sealed class UnblockIpCommandValidation : AbstractValidator<UnblockIpCommand>
    {
        public UnblockIpCommandValidation()
        {

        }
    }
}
