namespace PhysioBoo.Domain.Exceptions
{
    public sealed class UnauthenticatedException : Exception
    {
        public UnauthenticatedException(string message) : base(message)
        {
        }
    }
}
