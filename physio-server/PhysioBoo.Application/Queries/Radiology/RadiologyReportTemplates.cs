using PhysioBoo.Application.ViewModels.Radiology;

namespace PhysioBoo.Application.Queries.Radiology
{
    /// <summary>
    /// Built-in structured report templates offered in the reporting tab.
    /// Ids are fixed so a browser that remembers a selection keeps working across releases.
    /// </summary>
    public static class RadiologyReportTemplates
    {
        public static readonly IReadOnlyList<RadiologyReportTemplateViewModel> All = new List<RadiologyReportTemplateViewModel>
        {
            new(Guid.Parse("7a1d0001-0000-4000-8000-000000000001"), "Chest X-ray (PA) – normal", "X-Ray", true,
                "Cough / screening.",
                "Single PA view of the chest.",
                "Lungs are clear. No focal consolidation, effusion or pneumothorax. Cardiomediastinal silhouette is within normal limits. Bony thorax is intact.",
                "No acute cardiopulmonary abnormality.",
                "No further imaging required."),
            new(Guid.Parse("7a1d0001-0000-4000-8000-000000000002"), "CT head (non-contrast)", "CT", true,
                "Headache / head injury.",
                "Axial non-contrast CT of the head with coronal and sagittal reformats.",
                "No intracranial haemorrhage, mass effect or midline shift. Grey-white differentiation is preserved. Ventricles and sulci are normal for age. No skull fracture.",
                "No acute intracranial abnormality.",
                "Clinical follow-up as indicated."),
            new(Guid.Parse("7a1d0001-0000-4000-8000-000000000003"), "MRI lumbar spine", "MRI", false,
                "Low back pain with or without radiculopathy.",
                "Sagittal T1, T2 and STIR; axial T2 through L1–S1.",
                "Normal lumbar lordosis. Vertebral body heights and marrow signal are preserved. Discs, spinal canal and neural foramina are described level by level below.",
                "",
                "Correlate with clinical findings; physiotherapy review if symptoms persist."),
            new(Guid.Parse("7a1d0001-0000-4000-8000-000000000004"), "Ultrasound abdomen", "Ultrasound", false,
                "Abdominal pain.",
                "Real-time grey-scale and colour Doppler ultrasound of the abdomen.",
                "Liver is normal in size and echotexture. Gallbladder is normal without calculi. CBD is not dilated. Pancreas, spleen and both kidneys are unremarkable. No free fluid.",
                "Normal abdominal ultrasound.",
                "No further imaging required."),
            new(Guid.Parse("7a1d0001-0000-4000-8000-000000000005"), "Knee X-ray (2 views)", "X-Ray", false,
                "Knee pain / trauma.",
                "AP and lateral views of the knee.",
                "No fracture or dislocation. Joint spaces are preserved. No joint effusion. Soft tissues are unremarkable.",
                "No acute osseous abnormality.",
                ""),
        };
    }
}
