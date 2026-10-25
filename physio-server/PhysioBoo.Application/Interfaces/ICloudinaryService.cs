namespace PhysioBoo.Application.Interfaces
{
    public interface ICloudinaryService
    {
        /// <summary>
        /// Remove the tag (e.g., “temporary”) from the image to prevent it from being accidentally deleted by a job.
        /// </summary>
        public Task RemoveTagAsync(string publicId, string tag);

        /// <summary>
        /// Uploads an image under a server-generated public id inside <paramref name="folder"/>.
        /// Throws when the provider rejects the upload.
        /// </summary>
        Task<CloudinaryImageUpload> UploadImageAsync(Stream content, string folder, CancellationToken ct = default);

        /// <summary>
        /// Deletes an image by public id. A missing image counts as deleted. Throws on provider errors.
        /// </summary>
        Task DeleteImageAsync(string publicId, CancellationToken ct = default);
    }

    public sealed record CloudinaryImageUpload(string Url, string PublicId);
}
