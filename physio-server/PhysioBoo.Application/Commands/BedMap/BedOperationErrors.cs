using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.BedMap
{
    // Maps the error code returned by IBedRepository.AssignPatientAsync / DischargeAsync to a user-facing message.
    internal static class BedOperationErrors
    {
        public static string Describe(string? errorCode)
        {
            return errorCode switch
            {
                ErrorCodes.ObjectNotFound => "Bed doesn't exist.",
                DomainErrorCodes.Bed.NotAvailable => "Bed is not available.",
                DomainErrorCodes.Bed.NotOccupied => "Bed is not occupied.",
                DomainErrorCodes.Bed.PatientAlreadyAssigned => "This patient already occupies a bed.",
                _ => "Failed to update the bed."
            };
        }
    }
}
