using PhysioBoo.Application.Commands.MedicalRecords.CreateMedicalRecord;
using PhysioBoo.Application.Queries.MedicalRecords.GetBillingSummary;
using PhysioBoo.Application.Queries.MedicalRecords.GetClinicalNotes;
using PhysioBoo.Application.Queries.MedicalRecords.GetClinicalSnapshot;
using PhysioBoo.Application.Queries.MedicalRecords.GetContext;
using PhysioBoo.Application.Queries.MedicalRecords.GetDiagnoses;
using PhysioBoo.Application.Queries.MedicalRecords.GetEncounters;
using PhysioBoo.Application.Queries.MedicalRecords.GetHistory;
using PhysioBoo.Application.Queries.MedicalRecords.GetImagings;
using PhysioBoo.Application.Queries.MedicalRecords.GetLab;
using PhysioBoo.Application.Queries.MedicalRecords.GetPatientAllergies;
using PhysioBoo.Application.Queries.MedicalRecords.GetPatientDemoGraphics;
using PhysioBoo.Application.Queries.MedicalRecords.GetPrescriptions;
using PhysioBoo.Application.ViewModels.MedicalRecords;
using PhysioBoo.Domain.Constants;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class MedicalRecordEndpoints
    {
        public static void MapMedicalRecordEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/medical-records")
                .WithTags("Medical Records")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Create New Medical Record
            group.MapPost("/create", async (
                CreateMedicalRecordViewModel newMedicalRecord,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new CreateMedicalRecordCommand(newMedicalRecord));

                return Results.Created($"/api/medical-records/{newMedicalRecord.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newMedicalRecord.Id
                });
            }).WithName("CreateMedicalRecord")
            .WithSummary("Create new medical record")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Clinical.MedicalRecordCreate);
            #endregion

            #region Get Record Context
            group.MapGet("{patientId:guid}/context", async (
                Guid patientId,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PatientContextViewModel? result = await bus.QueryAsync(new GetMedicalRecordContextQuery(patientId));

                return Results.Ok(new ResponseMessage<PatientContextViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetMedicalRecordContext")
            .WithSummary("Retrieve a medical record context.")
            .Produces<ResponseMessage<PatientContextViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PatientContextViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Clinical.MedicalRecordRead);
            #endregion

            #region Get Record Snapshot
            group.MapGet("{patientId:guid}/snapshot", async (
                Guid patientId,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                ClinicalSnapshotViewModel? result = await bus.QueryAsync(new GetMedicalRecordClinicalSnapshotQuery(patientId));

                return Results.Ok(new ResponseMessage<ClinicalSnapshotViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetMedicalRecordSnapshot")
            .WithSummary("Retrieve a medical record snapshot.")
            .Produces<ResponseMessage<ClinicalSnapshotViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<ClinicalSnapshotViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Clinical.MedicalRecordRead);
            #endregion

            #region Get Record Demo Graphics
            group.MapGet("{patientId:guid}/demographics", async (
                Guid patientId,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PatientDemographicsViewModel? result = await bus.QueryAsync(new GetMedicalRecordPatientDemoGraphicsQuery(patientId));

                return Results.Ok(new ResponseMessage<PatientDemographicsViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetMedicalRecordDemoGraphics")
            .WithSummary("Retrieve a medical record demo graphics.")
            .Produces<ResponseMessage<PatientDemographicsViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PatientDemographicsViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Clinical.MedicalRecordRead);
            #endregion

            #region Get Record History
            group.MapGet("{patientId:guid}/history", async (
                Guid patientId,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                HistoricalSummaryViewModel? result = await bus.QueryAsync(new GetMedicalRecordHistoryQuery(patientId));

                return Results.Ok(new ResponseMessage<HistoricalSummaryViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetMedicalRecordHistory")
            .WithSummary("Retrieve a medical record history.")
            .Produces<ResponseMessage<HistoricalSummaryViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<HistoricalSummaryViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Clinical.MedicalRecordRead);
            #endregion

            #region Get Record Allergies
            group.MapGet("{patientId:guid}/allergies", async (
                Guid patientId,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<PatientAllergyViewModel> result = await bus.QueryAsync(new GetMedicalRecordPatientAllergiesQuery(patientId));

                return Results.Ok(new ResponseMessage<PagedResult<PatientAllergyViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetMedicalRecordAllergies")
            .WithSummary("Retrieve list of medical record allergies.")
            .Produces<ResponseMessage<PagedResult<PatientAllergyViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<PatientAllergyViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Clinical.MedicalRecordViewAllergies);
            #endregion

            #region Get Record Encounters
            group.MapGet("{patientId:guid}/encounters", async (
                Guid patientId,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<EncounterViewModel> result = await bus.QueryAsync(new GetMedicalRecordEncountersQuery(patientId));

                return Results.Ok(new ResponseMessage<PagedResult<EncounterViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetMedicalRecordEncounters")
            .WithSummary("Retrieve a medical record encounters.")
            .Produces<ResponseMessage<PagedResult<EncounterViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<EncounterViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Clinical.MedicalRecordRead);
            #endregion

            #region Get Record Diagnoses
            group.MapGet("{patientId:guid}/diagnoses", async (
                Guid patientId,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<DiagnosisViewModel> result = await bus.QueryAsync(new GetMedicalRecordDiagnosesQuery(patientId));

                return Results.Ok(new ResponseMessage<PagedResult<DiagnosisViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetMedicalRecordDiagnoses")
            .WithSummary("Retrieve a medical record diagnoses.")
            .Produces<ResponseMessage<PagedResult<DiagnosisViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<DiagnosisViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Clinical.MedicalRecordViewDiagnoses);
            #endregion

            #region Get Record Prescriptions
            group.MapGet("{patientId:guid}/prescriptions", async (
                Guid patientId,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<PrescriptionViewModel> result = await bus.QueryAsync(new GetMedicalRecordPrescriptionsQuery(patientId));

                return Results.Ok(new ResponseMessage<PagedResult<PrescriptionViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetMedicalRecordPrescriptions")
            .WithSummary("Retrieve a medical record prescriptions.")
            .Produces<ResponseMessage<PagedResult<PrescriptionViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<PrescriptionViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Clinical.MedicalRecordViewPrescriptions);
            #endregion

            #region Get Record Lab
            group.MapGet("{patientId:guid}/lab", async (
                Guid patientId,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                object? result = await bus.QueryAsync(new GetMedicalRecordLabQuery(patientId));

                return Results.Ok(new ResponseMessage<object?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetMedicalRecordLab")
            .WithSummary("Retrieve a medical record lab (includes results * reports).")
            .Produces<ResponseMessage<object?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<object?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Clinical.MedicalRecordViewLab);
            #endregion

            #region Get Record Imaging
            group.MapGet("{patientId:guid}/imaging", async (
                Guid patientId,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<ImagingStudyViewModel> result = await bus.QueryAsync(new GetMedicalRecordImagingsQuery(patientId));

                return Results.Ok(new ResponseMessage<PagedResult<ImagingStudyViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetMedicalRecordImaging")
            .WithSummary("Retrieve a medical record imaging.")
            .Produces<ResponseMessage<PagedResult<ImagingStudyViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<ImagingStudyViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Clinical.MedicalRecordViewImaging);
            #endregion

            #region Get Record Notes
            group.MapGet("{patientId:guid}/notes", async (
                Guid patientId,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<ClinicalNoteViewModel> result = await bus.QueryAsync(new GetMedicalRecordClinicalNotesQuery(patientId));

                return Results.Ok(new ResponseMessage<PagedResult<ClinicalNoteViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetMedicalRecordNotes")
            .WithSummary("Retrieve a medical record notes.")
            .Produces<ResponseMessage<PagedResult<ClinicalNoteViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<ClinicalNoteViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Clinical.MedicalRecordViewNotes);
            #endregion

            #region Get Record Billing
            group.MapGet("{patientId:guid}/billing", async (
                Guid patientId,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                BillingSummaryViewModel? result = await bus.QueryAsync(new GetMedicalRecordBillingQuery(patientId));

                return Results.Ok(new ResponseMessage<BillingSummaryViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetMedicalRecordBilling")
            .WithSummary("Retrieve a medical record billing.")
            .Produces<ResponseMessage<BillingSummaryViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<BillingSummaryViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Clinical.MedicalRecordViewBilling);
            #endregion
        }
    }
}
