namespace PhysioBoo.Domain.Errors
{
    public static class ErrorCodes
    {
        public const string CommitFailed = "COMMIT_FAILED";
        public const string ObjectNotFound = "OBJECT_NOT_FOUND";
        public const string InsufficientPermissions = "UNAUTHORIZED";
        public const string DuplicateValue = "DUPLICATE_VALUE";
        public const string InvalidValue = "INVALID_VALUE";
        public const string ValidationFailed = "VALIDATION_FAILED";
        public const string InvalidOperation = "INVALID_OPERATION";
        public const string InvalidSignature = "INVALID_SIGNATURE";
        public const string ProviderUnavailable = "PROVIDER_UNAVAILABLE";
        public const string ProviderTimeOut = "PROVIDER_TIMEOUT";
        public const string InvalidPayload = "INVALID_PAYLOAD";
        public const string InquiryNetworkError = "INQUIRY_NETWORK_ERROR";
        public const string InquiryTimeOut = "INQUIRY_TIMEOUT";
        public const string AuthenticationFailed = "AUTHENTICATION_FAILED";
    }
}
